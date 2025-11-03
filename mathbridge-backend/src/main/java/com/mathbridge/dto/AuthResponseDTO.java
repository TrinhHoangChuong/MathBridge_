package com.mathbridge.dto;

public class AuthResponseDTO {

    private boolean success;
    private String token;
    private String tokenType;
    private long expiresIn;
    private AuthenticatedAccountDTO user;

    public AuthResponseDTO() {
    }

    public AuthResponseDTO(boolean success, String token, String tokenType, long expiresIn, AuthenticatedAccountDTO user) {
        this.success = success;
        this.token = token;
        this.tokenType = tokenType;
        this.expiresIn = expiresIn;
        this.user = user;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public AuthenticatedAccountDTO getUser() {
        return user;
    }

    public void setUser(AuthenticatedAccountDTO user) {
        this.user = user;
    }
}
