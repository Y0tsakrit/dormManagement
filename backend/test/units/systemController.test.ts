const mockFindUnique = jest.fn();
const mockCreate = jest.fn();

// Mock Prisma client
jest.mock("../../generated/prisma", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: mockFindUnique,
        create: mockCreate,
      },
    })),
  };
});


import { registerUser, loginUser } from "../../src/Controller/systemController";
import { getRoomByUser } from "../../src/model/roomModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



// Mock bcrypt
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock getRoomByUser function from your controller
jest.mock("../../src/model/roomModel", () => ({
  getRoomByUser: jest.fn(),
}));

const mockGetRoomByUser = getRoomByUser as jest.Mock;

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

describe("registerUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register a new user successfully", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "password123",
        fname: "Test",
        lname: "User",
        phone: "1234567890",
      },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    // user does not exist
    mockFindUnique.mockResolvedValue(null);

    // bcrypt hashing
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");

    // create user
    mockCreate.mockResolvedValue({
      id: "user123",
      email: req.body.email,
      fname: req.body.fname,
      lname: req.body.lname,
      password: "hashedPassword123",
      phone: req.body.phone,
    });

    await registerUser(req, res);

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("password123", expect.any(Number));

    // Prisma create expects data property
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        ...req.body,
        password: "hashedPassword123",
      },
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "User registered successfully",
    });
  });
  it("should respond 409 if email already exists", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "password123",
        fname: "Test",
        lname: "User",
        phone: "1234567890",
      },
    } as any;

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as any;

    // user already exists
    mockFindUnique.mockResolvedValue({
        id: "user123",
        email: req.body.email,
        fname: req.body.fname,
        lname: req.body.lname,
        phone: "0841253531",
    });

    await registerUser(req, res);

    expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
    });

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
        message: "Email already exists",
    });
  });

    it("should respond 409 if phone already exists", async () => {
    const req = {
        body: {
        email: "test@example.com",
        password: "password123",
        fname: "Test",
        lname: "User",
        phone: "1234567890",
        },
    } as any;

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as any;

    // 1st call for email check — no user found
    // 2nd call for phone check — user found
    mockFindUnique
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce({
        id: "user123",
        email: "another@example.com",
        fname: req.body.fname,
        lname: req.body.lname,
        phone: req.body.phone,
        }); // phone check

    await registerUser(req, res);

    expect(mockFindUnique).toHaveBeenNthCalledWith(1, {
        where: { email: "test@example.com" },
    });

    expect(mockFindUnique).toHaveBeenNthCalledWith(2, {
        where: { phone: "1234567890" },
    });

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
        message: "Phone number already exists",
    });
});

});

describe("loginUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "testsecret";
  });

  it("should log in a user successfully", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    } as any;

    // Mock user found in DB
    mockFindUnique.mockResolvedValue({
      id: "user123",
      email: req.body.email,
      password: "hashedPassword123",
      isActive: true,
      isAdmin: false,
      room: []
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    mockGetRoomByUser.mockResolvedValue([
      { id: "room1" },
      { id: "room2" },
    ]);

    (jwt.sign as jest.Mock).mockReturnValue("mocked-jwt-token");

    await loginUser(req, res);

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });

    expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashedPassword123");

    expect(mockGetRoomByUser).toHaveBeenCalledWith("user123");

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: "user123", rooms: ["room1", "room2"], isAdmin: false },
      expect.any(String),
      { expiresIn: "1h" }
    );

    expect(res.cookie).toHaveBeenCalledWith("token", "mocked-jwt-token", {
      httpOnly: true,
      secure: expect.any(Boolean),
      sameSite: "strict",
      maxAge: 3600000,
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: "mocked-jwt-token" });
  });

  it("should respond 404 if user not found", async () => {
    const req = { body: { email: "unknown@example.com", password: "pass" } } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    } as any;

    mockFindUnique.mockResolvedValue(null);

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should respond 401 if password is invalid", async () => {
    const req = { body: { email: "test@example.com", password: "wrongpass" } } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    } as any;

    mockFindUnique.mockResolvedValue({
      id: "user123",
      email: req.body.email,
      password: "hashedPassword123",
      isActive: true,
      isAdmin: false,
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid password" });
  });

  it("should respond 403 if user is not active", async () => {
    const req = { body: { email: "test@example.com", password: "password123" } } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    } as any;

    mockFindUnique.mockResolvedValue({
      id: "user123",
      email: req.body.email,
      password: "hashedPassword123",
      isActive: false,
      isAdmin: false,
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "User is not active" });
  });
});
