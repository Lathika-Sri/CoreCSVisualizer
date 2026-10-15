package com.corecs.dbms.dto;import jakarta.validation.constraints.NotBlank;public record QueryRequest(@NotBlank String sql){}
