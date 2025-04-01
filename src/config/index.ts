
export const config = {
    dbUrl : process.env.DB_URI || "mongodb://localhost:27017/ledger",
    jwtSecret: process.env.JWT_SECRET || "TEST_SECRET_KEY",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "REFRESH_SECRET_KEY",
    accessTokenValidity: process.env.ACCESS_TOKEN_EXPIRES_IN || "1h",
    refreshTokenValidity: process.env.REFREST_TOKEN_EXPIRES_IN || "7d"
}