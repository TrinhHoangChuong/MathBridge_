package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "Admin")
public class Admin {
    @Id
    @Column(name = "UserName", length = 255, nullable = false)
    private String userName;

    @Column(name = "PassWord", length = 255, nullable = false)
    private String passWord;
}
