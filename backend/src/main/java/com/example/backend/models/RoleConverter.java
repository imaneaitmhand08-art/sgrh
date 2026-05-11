package com.example.backend.models;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class RoleConverter implements AttributeConverter<Role, String> {

    @Override
    public String convertToDatabaseColumn(Role role) {
        if (role == null) return null;
        return role.name().toLowerCase();
    }

    @Override
    public Role convertToEntityAttribute(String dbValue) {
        if (dbValue == null) return null;
        return Role.valueOf(dbValue.toUpperCase());
    }
}