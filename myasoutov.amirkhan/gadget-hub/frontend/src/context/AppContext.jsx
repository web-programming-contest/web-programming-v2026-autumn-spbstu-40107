import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  API_URL,
  PAGE_PATHS,
  PRODUCT_COLORS,
  PRODUCT_TYPES,
  SESSION_STORAGE_KEY,
  authHeaders,
  cartStorageKey,
  readCart,
  readSession
} from '../constants';

const AppContext = createContext(null);

export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(readSession);
  const [authChecking, setAuthChecking] = useState(() => Boolean(readSession()?.token));
  const user = session?.username ?? null;

  const [goods, setGoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState(() => readCart(session?.username));
  const skipCartSyncRef = useRef(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null);
  const [orderSuccessModal, setOrderSuccessModal] = useState(null);

  const [hitIndex, setHitIndex] = useState(0);
  const [newIndex, setNewIndex] = useState(0);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({ username: false, password: false });
  const [loginServerError, setLoginServerError] = useState('');

  const [draftPriceFrom, setDraftPriceFrom] = useState('');
  const [draftPriceTo, setDraftPriceTo] = useState('');
  const [draftTypes, setDraftTypes] = useState([]);
  const [draftColors, setDraftColors] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState({
    priceFrom: '',
    priceTo: '',
    types: [],
    colors: []
  });

  const [sortBy, setSortBy] = useState('new');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  const [cartTab, setCartTab] = useState('cart');

  const [orderPhone, setOrderPhone] = useState('');
  const [orderEmail, setOrderEmail] = useState('');
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [orderAddress, setOrderAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('По карте');
  const [needPackaging, setNeedPackaging] = useState(false);
  const [orderErrors, setOrderErrors] = useState({ phone: false, address: false });

  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
    setCart([]);
    setOrders([]);
    setSelectedProduct(null);
    setLoginServerError('');
    navigate(PAGE_PATHS.home);
  }, [navigate]);

  const fetchOrders = useCallback(
    async (token = session?.token) => {
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/orders`, {
          headers: authHeaders(token)
        });

        if (res.status === 401) {
          clearSession();
          return;
        }

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Ошибка загрузки заказов');
        }
        setOrders(data);
      } catch (err) {
        console.error('Ошибка загрузки заказов:', err);
      }
    },
    [clearSession, session?.token]
  );

  // Проверяем сохранённую сессию на сервере до показа защищённых страниц
  const initialSessionRef = useRef(session);
  useEffect(() => {
    const token = initialSessionRef.current?.token;
    if (!token) {
      setAuthChecking(false);
      return undefined;
    }

    let cancelled = false;

    fetch(`${API_URL}/me`, { headers: authHeaders(token) })
      .then((res) => {
        if (!res.ok) throw new Error('Сессия недействительна');
        return res.json();
      })
      .then((data) => {
        if (!cancelled && data.username) {
          setSession((prev) => (prev ? { ...prev, username: data.username } : prev));
        }
      })
      .catch(() => {
        if (!cancelled) clearSession();
      })
      .finally(() => {
        if (!cancelled) setAuthChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  useEffect(() => {
    fetch(`${API_URL}/goods`)
      .then((res) => res.json())
      .then((data) => setGoods(data))
      .catch((err) => console.error('Ошибка загрузки товаров:', err));
  }, []);

  useEffect(() => {
    if (!session?.token || authChecking) return;
    fetchOrders(session.token);
  }, [authChecking, fetchOrders, session?.token]);

  useEffect(() => {
    if (!user) return;
    if (skipCartSyncRef.current) {
      skipCartSyncRef.current = false;
      return;
    }
    localStorage.setItem(cartStorageKey(user), JSON.stringify(cart));
  }, [cart, user]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setSelectedProduct(null);
      setDeleteConfirmModal(null);
      setOrderSuccessModal(null);
      setLoginServerError('');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateTo = useCallback(
    (targetPage) => {
      if ((targetPage === 'catalog' || targetPage === 'cart') && !user) {
        navigate(PAGE_PATHS.login);
        return;
      }
      navigate(PAGE_PATHS[targetPage] || PAGE_PATHS.home);
      window.scrollTo(0, 0);
    },
    [navigate, user]
  );

  const getQuantity = useCallback(
    (productId) => {
      const found = cart.find((item) => item.id === productId);
      return found ? found.quantity : 0;
    },
    [cart]
  );

  const addToCart = useCallback(
    (productId) => {
      if (!user) {
        setSelectedProduct(null);
        navigate(PAGE_PATHS.login);
        return;
      }
      setCart((prev) => {
        const existing = prev.find((item) => item.id === productId);
        if (existing) {
          return prev.map((item) =>
            item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prev, { id: productId, quantity: 1, checked: true }];
      });
    },
    [navigate, user]
  );

  const changeQuantity = useCallback((productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    const errors = {
      username: !loginUsername.trim(),
      password: !loginPassword.trim()
    };
    setLoginErrors(errors);
    if (errors.username || errors.password) return;

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword.trim()
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success || !data.token) {
        setLoginServerError(
          data.message ||
            'такого пользователя нет, возможно неправильный логин или пароль - проверьте данные'
        );
        return;
      }

      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ token: data.token, username: data.username })
      );
      setSession({ token: data.token, username: data.username });
      setCart(readCart(data.username));
      setOrders([]);
      setSelectedProduct(null);
      setLoginUsername('');
      setLoginPassword('');
      setLoginServerError('');
      navigate(PAGE_PATHS.home);
    } catch {
      setLoginServerError('Ошибка соединения с сервером');
    }
  };

  const handleLogout = async () => {
    if (session?.token) {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: authHeaders(session.token)
      }).catch(() => {});
    }
    clearSession();
  };

  const hitGoods = useMemo(() => goods.filter((item) => item.isHit), [goods]);
  const newGoods = useMemo(() => goods.filter((item) => item.isNew), [goods]);
  const heroProduct = useMemo(
    () => goods.find((item) => item.id === 16) || goods[0] || null,
    [goods]
  );

  const getCarouselSlice = useCallback((list, startIndex) => {
    if (list.length === 0) return [];
    const result = [];
    const count = Math.min(3, list.length);
    for (let i = 0; i < count; i += 1) {
      result.push(list[(startIndex + i) % list.length]);
    }
    return result;
  }, []);

  const filteredAndSortedGoods = useMemo(() => {
    let result = [...goods];

    const minPrice = parseFloat(appliedFilters.priceFrom);
    const maxPrice = parseFloat(appliedFilters.priceTo);

    if (!Number.isNaN(minPrice)) {
      result = result.filter((item) => item.price >= minPrice);
    }
    if (!Number.isNaN(maxPrice)) {
      result = result.filter((item) => item.price <= maxPrice);
    }
    if (appliedFilters.types.length > 0) {
      result = result.filter((item) => appliedFilters.types.includes(item.type));
    }
    if (appliedFilters.colors.length > 0) {
      result = result.filter((item) => appliedFilters.colors.includes(item.color));
    }

    result.sort((a, b) => {
      if (sortBy === 'new') {
        return Number(b.isNew) - Number(a.isNew) || a.id - b.id;
      }
      if (sortBy === 'popular') return b.rating - a.rating;
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });

    return result;
  }, [appliedFilters, goods, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedGoods.length / ITEMS_PER_PAGE)
  );

  const paginatedGoods = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedGoods.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredAndSortedGoods]);

  const handleApplyFilters = (event) => {
    event.preventDefault();
    setAppliedFilters({
      priceFrom: draftPriceFrom,
      priceTo: draftPriceTo,
      types: draftTypes,
      colors: draftColors
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setDraftPriceFrom('');
    setDraftPriceTo('');
    setDraftTypes([]);
    setDraftColors([]);
    setAppliedFilters({ priceFrom: '', priceTo: '', types: [], colors: [] });
    setCurrentPage(1);
  };

  const toggleCheckboxList = (list, setList, value) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const cartDetailed = useMemo(
    () =>
      cart
        .map((item) => {
          const product = goods.find((entry) => entry.id === item.id);
          return product
            ? { ...product, quantity: item.quantity, checked: item.checked }
            : null;
        })
        .filter(Boolean),
    [cart, goods]
  );

  const allChecked = cartDetailed.length > 0 && cartDetailed.every((item) => item.checked);
  const selectedCartItems = cartDetailed.filter((item) => item.checked);
  const totalCartPrice = selectedCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalCartUnits = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const toggleAllCart = (checked) => {
    setCart((prev) => prev.map((item) => ({ ...item, checked })));
  };

  const toggleCartItemCheck = (productId) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const confirmDeleteAction = () => {
    if (!deleteConfirmModal) return;
    if (deleteConfirmModal.mode === 'single') {
      setCart((prev) => prev.filter((item) => item.id !== deleteConfirmModal.product.id));
    } else if (deleteConfirmModal.mode === 'selected') {
      setCart((prev) => prev.filter((item) => !item.checked));
    }
    setDeleteConfirmModal(null);
  };

  const handleOrderSubmit = async (event) => {
    event.preventDefault();

    const errors = {
      phone: !orderPhone.trim(),
      address: deliveryType === 'delivery' && !orderAddress.trim()
    };
    setOrderErrors(errors);
    if (errors.phone || errors.address || selectedCartItems.length === 0) return;

    const items = selectedCartItems.map(({ id, name, price, image, quantity }) => ({
      id,
      name,
      price,
      image,
      quantity
    }));

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: authHeaders(session?.token, true),
        body: JSON.stringify({
          items,
          customer: {
            phone: orderPhone.trim(),
            email: orderEmail.trim(),
            deliveryType,
            address: deliveryType === 'delivery' ? orderAddress.trim() : 'Самовывоз',
            paymentMethod,
            needPackaging
          }
        })
      });

      if (res.status === 401) {
        clearSession();
        return;
      }

      const newOrder = await res.json();
      if (!res.ok) return;

      skipCartSyncRef.current = true;
      setCart([]);
      localStorage.removeItem(cartStorageKey(user));
      setOrderPhone('');
      setOrderEmail('');
      setOrderAddress('');
      setNeedPackaging(false);
      fetchOrders(session?.token);
      setOrderSuccessModal(newOrder.id);
    } catch (err) {
      console.error('Ошибка отправки заказа:', err);
    }
  };

  const closeOrderSuccess = () => {
    setOrderSuccessModal(null);
    setCartTab('history');
    navigate(PAGE_PATHS.cart);
  };

  const value = {
    user,
    authChecking,
    goods,
    orders,
    cart,
    cartDetailed,
    selectedCartItems,
    allChecked,
    totalCartPrice,
    totalCartUnits,
    totalCartItemsCount,
    selectedProduct,
    setSelectedProduct,
    deleteConfirmModal,
    setDeleteConfirmModal,
    orderSuccessModal,
    closeOrderSuccess,
    setOrderSuccessModal,
    hitGoods,
    newGoods,
    heroProduct,
    getCarouselSlice,
    hitIndex,
    setHitIndex,
    newIndex,
    setNewIndex,
    loginUsername,
    setLoginUsername,
    loginPassword,
    setLoginPassword,
    loginErrors,
    setLoginErrors,
    loginServerError,
    setLoginServerError,
    handleLoginSubmit,
    handleLogout,
    navigateTo,
    getQuantity,
    addToCart,
    changeQuantity,
    draftPriceFrom,
    setDraftPriceFrom,
    draftPriceTo,
    setDraftPriceTo,
    draftTypes,
    setDraftTypes,
    draftColors,
    setDraftColors,
    appliedFilters,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    ITEMS_PER_PAGE,
    totalPages,
    filteredAndSortedGoods,
    paginatedGoods,
    PRODUCT_TYPES,
    PRODUCT_COLORS,
    handleApplyFilters,
    handleResetFilters,
    toggleCheckboxList,
    cartTab,
    setCartTab,
    toggleAllCart,
    toggleCartItemCheck,
    confirmDeleteAction,
    orderPhone,
    setOrderPhone,
    orderEmail,
    setOrderEmail,
    deliveryType,
    setDeliveryType,
    orderAddress,
    setOrderAddress,
    paymentMethod,
    setPaymentMethod,
    needPackaging,
    setNeedPackaging,
    orderErrors,
    setOrderErrors,
    handleOrderSubmit
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
