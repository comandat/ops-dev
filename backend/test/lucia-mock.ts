export class Lucia {
    constructor() { }
    createSession() { }
    createSessionCookie() { return { serialize: () => '' }; }
    createBlankSessionCookie() { return { serialize: () => '' }; }
    invalidateSession() { }
    validateSession() { return { session: null, user: null }; }
    readSessionCookie() { }
}
export class PrismaAdapter {
    constructor() { }
}
export class Scrypt {
    hash() { return Promise.resolve('hashed'); }
    verify() { return Promise.resolve(true); }
}
