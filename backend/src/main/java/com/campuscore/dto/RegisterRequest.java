package com.campuscore.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Pattern(regexp = "^[A-Za-z][A-Za-z0-9_.]*$", message = "Username must start with a letter")
    private String username;

    @NotBlank(message = "Password is required")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\\W_]).{8,}$", message = "Password must contain uppercase, lowercase, number, special char and be 8+ characters")
    private String password;

    @NotBlank(message = "Role is required")
    private String role;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter valid email address")
    private String email;

    @Pattern(regexp = "^(\\+91)?[6-9][0-9]{9}$", message = "Enter valid Indian phone number")
    private String phone;

    private String rollNo;
    private String className;
    private String subject;

    // Used only when role = Parent, to link the parent account to their child
    private String childRollNo;
    private String relation; // Father, Mother, Guardian
}