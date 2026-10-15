package com.corecs.cpu.dto;
import com.corecs.cpu.model.ProcessSpec;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
public record SimulationRequest(@NotBlank String algorithm,@NotEmpty List<@Valid ProcessSpec> processes,@Min(1) int timeQuantum) {}
