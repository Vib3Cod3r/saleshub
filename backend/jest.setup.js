// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = 'postgresql://postgres:Miyako2020@localhost:5432/sales_crm_test';
process.env.REDIS_URL = 'redis://localhost:6379';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific log levels during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Global test timeout
jest.setTimeout(10000);

// Mock environment variables
process.env.PORT = '8089';
process.env.API_URL = 'http://localhost:8089/api';

// Setup test utilities
global.testUtils = {
  createMockUser: (overrides = {}) => ({
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    tenantId: 'tenant-123',
    ...overrides,
  }),

  createMockSearchQuery: (overrides = {}) => ({
    text: 'test search',
    entities: ['Contact'],
    filters: [],
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
    ...overrides,
  }),

  createMockSearchResult: (overrides = {}) => ({
    data: [
      {
        id: '1',
        name: 'Test Contact',
        email: 'test@example.com',
        entityType: 'Contact',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    },
    metadata: {
      searchTime: 100,
      totalResults: 1,
      entityCounts: { Contact: 1 },
      query: { text: 'test search', entities: ['Contact'] },
    },
    ...overrides,
  }),

  createMockFilter: (overrides = {}) => ({
    field: 'name',
    operator: 'contains',
    value: 'test',
    ...overrides,
  }),

  createMockAnalytics: (overrides = {}) => ({
    totalSearches: 100,
    popularQueries: [
      { text: 'test', count: 10, successRate: 0.9 },
    ],
    entityUsage: [
      { entity: 'Contact', count: 50, percentage: 0.5 },
    ],
    searchTrends: [
      { date: '2024-01-01', searches: 10, change: 5 },
    ],
    ...overrides,
  }),

  createMockPerformanceMetrics: (overrides = {}) => ({
    averageResponseTime: 150,
    cacheHitRate: 0.8,
    successRate: 0.95,
    totalQueries: 1000,
    failedQueries: 50,
    ...overrides,
  }),

  createMockDashboard: (overrides = {}) => ({
    totalSearches: 1000,
    averageResponseTime: 150,
    cacheHitRate: 0.8,
    successRate: 0.95,
    popularQueries: [],
    entityUsage: [],
    searchTrends: [],
    ...overrides,
  }),

  // Mock API response helpers
  mockApiResponse: (data, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  }),

  mockApiError: (message, status = 400) => ({
    ok: false,
    status,
    json: async () => ({ message }),
  }),

  // Mock Redis response helpers
  mockRedisResponse: (data) => Promise.resolve(data),
  mockRedisError: (error) => Promise.reject(error),

  // Mock Prisma response helpers
  mockPrismaResponse: (data) => Promise.resolve(data),
  mockPrismaError: (error) => Promise.reject(error),
};

// Mock external services
jest.mock('ioredis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    hget: jest.fn(),
    hset: jest.fn(),
    hgetall: jest.fn(),
    zadd: jest.fn(),
    zrange: jest.fn(),
    zscore: jest.fn(),
    expire: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt'),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ userId: 'test-user', email: 'test@example.com' }),
}));

// Mock rate limiting
jest.mock('express-rate-limit', () => {
  return jest.fn().mockImplementation(() => {
    return (req, res, next) => next();
  });
});

// Mock helmet
jest.mock('helmet', () => {
  return jest.fn().mockImplementation(() => {
    return (req, res, next) => next();
  });
});

// Mock cors
jest.mock('cors', () => {
  return jest.fn().mockImplementation(() => {
    return (req, res, next) => next();
  });
});

// Mock compression
jest.mock('compression', () => {
  return jest.fn().mockImplementation(() => {
    return (req, res, next) => next();
  });
});

// Mock morgan
jest.mock('morgan', () => {
  return jest.fn().mockImplementation(() => {
    return (req, res, next) => next();
  });
});

// Mock express-validator
jest.mock('express-validator', () => ({
  body: jest.fn().mockReturnValue([]),
  validationResult: jest.fn().mockReturnValue({
    isEmpty: () => true,
    array: () => [],
  }),
}));

// Mock zod
jest.mock('zod', () => ({
  ...jest.requireActual('zod'),
  z: {
    ...jest.requireActual('zod').z,
    object: jest.fn().mockReturnValue({
      parse: jest.fn().mockImplementation((data) => data),
      safeParse: jest.fn().mockReturnValue({ success: true, data }),
    }),
    string: jest.fn().mockReturnValue({
      min: jest.fn().mockReturnThis(),
      max: jest.fn().mockReturnThis(),
      email: jest.fn().mockReturnThis(),
    }),
    array: jest.fn().mockReturnValue({
      min: jest.fn().mockReturnThis(),
      max: jest.fn().mockReturnThis(),
    }),
  },
}));

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  }),
}));

// Mock multer
jest.mock('multer', () => {
  return jest.fn().mockImplementation(() => {
    return (req, res, next) => next();
  });
});

// Mock sharp
jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => ({
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-image')),
  }));
});

// Mock fs promises
jest.mock('fs/promises', () => ({
  readFile: jest.fn().mockResolvedValue('mock-file-content'),
  writeFile: jest.fn().mockResolvedValue(),
  unlink: jest.fn().mockResolvedValue(),
  mkdir: jest.fn().mockResolvedValue(),
  access: jest.fn().mockResolvedValue(),
}));

// Mock path
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn().mockImplementation((...args) => args.join('/')),
  resolve: jest.fn().mockImplementation((...args) => args.join('/')),
}));

// Mock crypto
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomBytes: jest.fn().mockReturnValue(Buffer.from('mock-random-bytes')),
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mock-hash'),
  }),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid'),
  v1: jest.fn().mockReturnValue('mock-uuid-v1'),
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  format: jest.fn().mockReturnValue('2024-01-01'),
  parseISO: jest.fn().mockReturnValue(new Date('2024-01-01')),
  isValid: jest.fn().mockReturnValue(true),
}));

// Mock lodash
jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  debounce: jest.fn().mockImplementation((fn) => fn),
  throttle: jest.fn().mockImplementation((fn) => fn),
}));

// Setup cleanup
afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});
