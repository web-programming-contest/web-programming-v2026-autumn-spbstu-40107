import React, {useState, useEffect, useMemo} from 'react';

const STORAGE_KEY = 'lab5_finance_data';
const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#AF19FF',
  '#FF19A3',
];

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch {
        console.error('Failed to parse transactions');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const handleAddTransaction = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    const newTransaction = {
      id: crypto.randomUUID(),
      type: type || 'expense',
      amount: parsedAmount,
      category: (category || 'Без категории').trim(),
      description: (description || '').trim(),
      date: new Date().toISOString(),
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    setAmount('');
    setCategory('');
    setDescription('');
  };

  const handleDelete = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const chartData = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const grouped = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, value]) => ({name, value}));
  }, [transactions]);

  const totalExpense = chartData.reduce((sum, item) => sum + item.value, 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  let cumulativeAngle = 0;
  const slices = chartData.map((slice, index) => {
    const fraction = totalExpense > 0 ? slice.value / totalExpense : 0;
    const angle = fraction * 2 * Math.PI;

    const x1 = Math.cos(cumulativeAngle);
    const y1 = Math.sin(cumulativeAngle);
    cumulativeAngle += angle;
    const x2 = Math.cos(cumulativeAngle);
    const y2 = Math.sin(cumulativeAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;
    const pathData =
      fraction >= 0.999
        ? 'M 0 0 m -1, 0 a 1,1 0 1,0 2,0 a 1,1 0 1,0 -2,0'
        : `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    return {
      name: slice.name,
      value: slice.value,
      color: COLORS[index % COLORS.length],
      pathData,
      percent: Math.round(fraction * 100),
    };
  });

  return (
    <main data-testid="app" className="app-container">
      <h1>Учет личных финансов</h1>

      <div className="balance-board">
        <div className="balance-item income">
          <h3>Доходы</h3>
          <p>{totalIncome} ₽</p>
        </div>
        <div className="balance-item expense">
          <h3>Расходы</h3>
          <p>{totalExpense} ₽</p>
        </div>
        <div className="balance-item total">
          <h3>Баланс</h3>
          <p>{totalIncome - totalExpense} ₽</p>
        </div>
      </div>

      <div className="content-grid">
        <section className="form-section">
          <h2>Добавить операцию</h2>
          <form
            onSubmit={handleAddTransaction}
            className="transaction-form"
            data-testid="transaction-form"
          >
            <select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              data-testid="transaction-type"
            >
              <option value="expense">Расход</option>
              <option value="income">Доход</option>
            </select>
            <input
              name="amount"
              type="number"
              placeholder="Сумма"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              data-testid="transaction-amount"
            />
            <input
              name="category"
              type="text"
              placeholder="Категория"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              data-testid="transaction-category"
            />
            <input
              name="description"
              type="text"
              placeholder="Описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="transaction-description"
            />
            <button
              type="submit"
              onClick={handleAddTransaction}
              data-testid="transaction-add"
            >
              Добавить
            </button>
          </form>
        </section>

        <section className="chart-section" data-testid="finance-chart">
          <h2>Структура расходов</h2>
          {slices.length > 0 ? (
            <div className="chart-wrapper">
              <svg viewBox="-1.2 -1.2 2.4 2.4" className="pie-svg">
                {slices.map((slice) => (
                  <path
                    key={slice.name}
                    d={slice.pathData}
                    fill={slice.color}
                  />
                ))}
              </svg>
              <div className="chart-legend">
                {slices.map((slice) => (
                  <div key={slice.name} className="legend-row">
                    <span
                      className="legend-badge"
                      style={{backgroundColor: slice.color}}
                    />
                    <span className="legend-label">
                      {slice.name} ({slice.percent}%):
                    </span>
                    <strong className="legend-val">{slice.value} ₽</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="empty-msg" data-testid="empty-chart">
              Нет данных о расходах для диаграммы
            </p>
          )}
        </section>
      </div>

      <section className="history-section" data-testid="transaction-history">
        <h2>История транзакций</h2>
        {transactions.length === 0 ? (
          <p className="empty-msg" data-testid="empty-history">
            Транзакций пока нет
          </p>
        ) : (
          <ul className="transaction-list">
            {transactions.map((t) => (
              <li
                key={t.id}
                className={`transaction-item ${t.type}`}
                data-testid="transaction-item"
              >
                <div className="transaction-info">
                  <strong data-testid="item-category">{t.category}</strong>
                  <span
                    className="transaction-desc"
                    data-testid="item-description"
                  >
                    {t.description}
                  </span>
                  <span className="transaction-date">
                    {new Date(t.date).toLocaleDateString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="transaction-actions">
                  <span
                    className="transaction-amount"
                    data-testid="item-amount"
                  >
                    {t.type === 'income' ? '+' : '-'}
                    {t.amount} ₽
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    className="delete-btn"
                    data-testid="delete-transaction"
                  >
                    &times;
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
