package com.mathbridge.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Admin")
public class Admin {

    @Id
    @Column(name = "UserName", length = 255, nullable = false)
    private String userName;

    @Column(name = "PassWord", length = 255, nullable = false)
    private String password;

    public Admin() {
    }

    public Admin(String userName) {
        this.userName = userName;
    }

    // Getter / Setter
    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
