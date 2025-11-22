const mockConnection: any = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue([1]),
    update: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    first: jest.fn(),
    count: jest.fn().mockResolvedValue([{ total: 1 }]),
    clone: jest.fn().mockReturnThis(),

    then: jest.fn(),
};

export default mockConnection;
