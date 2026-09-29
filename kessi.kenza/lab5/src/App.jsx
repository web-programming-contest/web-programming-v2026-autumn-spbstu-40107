import {useEffect, useMemo, useState} from 'react';

const STORAGE_KEY = 'notes';

const INITIAL_NOTES = [
  {
    id: 1,
    title: 'Первая заметка',
    content: 'Пример заметки с тегами.',
    tags: ['учёба', 'важное'],
    date: '2026-09-14',
  },
  {
    id: 2,
    title: 'Купить продукты',
    content: 'Молоко, хлеб, кофе.',
    tags: ['личное'],
    date: '2026-09-15',
  },
];

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_NOTES;
  } catch {
    return INITIAL_NOTES;
  }
}

function parseTags(value) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function App() {
  const [notes, setNotes] = useState(loadNotes);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const allTags = useMemo(
    () => [...new Set(notes.flatMap((note) => note.tags))],
    [notes],
  );

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return notes.filter((note) => {
      const matchesSearch =
        !query ||
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query);
      const matchesTag = !tagFilter || note.tags.includes(tagFilter);
      const matchesDate = !dateFilter || note.date === dateFilter;
      return matchesSearch && matchesTag && matchesDate;
    });
  }, [notes, search, tagFilter, dateFilter]);

  const groups = useMemo(() => {
    const result = {};
    for (const tag of allTags) {
      result[tag] = notes.filter((note) => note.tags.includes(tag));
    }
    return result;
  }, [notes, allTags]);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }
    if (editingId === null) {
      const note = {
        id: Date.now(),
        title: trimmedTitle,
        content: content.trim(),
        tags: parseTags(tagsInput),
        date: new Date().toISOString().slice(0, 10),
      };
      setNotes((prev) => [note, ...prev]);
    } else {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === editingId
            ? {
                ...note,
                title: trimmedTitle,
                content: content.trim(),
                tags: parseTags(tagsInput),
              }
            : note,
        ),
      );
      setEditingId(null);
    }
    setTitle('');
    setContent('');
    setTagsInput('');
  }

  function startEdit(note) {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setTagsInput(note.tags.join(', '));
  }

  function deleteNote(id) {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setTitle('');
      setContent('');
      setTagsInput('');
    }
  }

  return (
    <main className="app" data-testid="app">
      <h1>Заметки</h1>

      <form className="note-form" onSubmit={handleSubmit}>
        <input
          data-testid="note-title"
          name="title"
          placeholder="Заголовок"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <textarea
          data-testid="note-content"
          name="content"
          placeholder="Текст заметки"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <input
          data-testid="note-tags"
          name="tags"
          placeholder="Теги через запятую"
          value={tagsInput}
          onChange={(event) => setTagsInput(event.target.value)}
        />
        <button data-testid="note-add" type="submit">
          {editingId === null ? 'Добавить заметку' : 'Сохранить изменения'}
        </button>
      </form>

      <section className="filters" aria-label="Фильтры">
        <input
          data-testid="note-search"
          name="search"
          placeholder="Поиск по содержимому"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          data-testid="note-tag-filter"
          name="tag-filter"
          value={tagFilter}
          onChange={(event) => setTagFilter(event.target.value)}
        >
          <option value="">Все теги</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <input
          data-testid="note-date-filter"
          name="date-filter"
          type="date"
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
        />
      </section>

      <section
        className="note-list"
        data-testid="note-list"
        aria-label="Список заметок"
      >
        {filteredNotes.length === 0 ? (
          <p className="note-list__empty">Заметок не найдено</p>
        ) : (
          filteredNotes.map((note) => (
            <article
              className="note-card"
              data-testid="note-item"
              key={note.id}
            >
              <h2 className="note-card__title">{note.title}</h2>
              <p className="note-card__content">{note.content}</p>
              <p className="note-card__meta">
                <span>{note.date}</span>
                {note.tags.map((tag) => (
                  <span className="note-card__tag" key={tag}>
                    #{tag}
                  </span>
                ))}
              </p>
              <div className="note-card__actions">
                <button type="button" onClick={() => startEdit(note)}>
                  Редактировать
                </button>
                <button type="button" onClick={() => deleteNote(note.id)}>
                  Удалить
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="groups" aria-label="Группы по тегам">
        <h2>Группы по тегам</h2>
        {Object.entries(groups).map(([tag, groupNotes]) => (
          <div className="groups__item" key={tag}>
            <h3>
              #{tag} ({groupNotes.length})
            </h3>
            <ul>
              {groupNotes.map((note) => (
                <li key={note.id}>{note.title}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}
