package com.corecs.cpu.controller;
import com.corecs.cpu.dto.SimulationRequest;import com.corecs.cpu.model.SimulationResult;import com.corecs.cpu.service.SchedulingService;import jakarta.validation.Valid;import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/cpu") public class CpuController {private final SchedulingService service;public CpuController(SchedulingService s){service=s;}@PostMapping("/simulate") public SimulationResult simulate(@Valid @RequestBody SimulationRequest request){return service.simulate(request);}}
