export const getLucia = jest.fn(() => ({
    createSession: jest.fn().mockResolvedValue({ id: 'mocked_session_id', fresh: true }),
    createSessionCookie: jest.fn().mockReturnValue({
        serialize: jest.fn().mockReturnValue('auth_session=mocked_session_id; Path=/; HttpOnly')
    }),
    createBlankSessionCookie: jest.fn().mockReturnValue({
        serialize: jest.fn().mockReturnValue('auth_session=; Path=/; HttpOnly; Max-Age=0')
    }),
    invalidateSession: jest.fn().mockResolvedValue(true),
    validateSession: jest.fn().mockResolvedValue({
        session: { id: 'mocked_session_id', fresh: false },
        user: { id: 'mock_user_id', tenantId: 'tenant1_mock' }
    }),
    readSessionCookie: jest.fn().mockReturnValue('mocked_session_id')
}));

export const getLuciaAdapter = jest.fn();
