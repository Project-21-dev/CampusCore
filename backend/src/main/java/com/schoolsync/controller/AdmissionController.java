package com.schoolsync.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.schoolsync.dto.AdmissionDTO;
import com.schoolsync.dto.AdmissionStatusUpdateDTO;
import com.schoolsync.entity.Admission;
import com.schoolsync.service.AdmissionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admission")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdmissionController {

    private final AdmissionService admissionService;

    @PostMapping("/apply")
    public ResponseEntity<Map<String, Object>> applyAdmission(@RequestBody Admission admission) {
        return ResponseEntity.ok(admissionService.applyAdmission(admission));
    }

    @GetMapping("/check-status")
    public ResponseEntity<?> checkStatus(@RequestParam(required = false) String email,
            @RequestParam(required = false) String phone) {
        try {
            return ResponseEntity.ok(admissionService.checkStatus(email, phone));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<AdmissionDTO>> getAllAdmissions() {
        return ResponseEntity.ok(admissionService.getAllAdmissions());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<AdmissionDTO> getAdmissionById(@PathVariable Long id) {
        try {
            AdmissionDTO admission = admissionService.getAdmissionById(id);
            return ResponseEntity.ok(admission);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updateAdmissionStatus(
            @PathVariable Long id,
            @RequestBody AdmissionStatusUpdateDTO statusUpdate) {
        try {
            admissionService.updateAdmissionStatus(id, statusUpdate);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Admission status updated successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateAdmission(@PathVariable Long id, @RequestBody Admission updatedAdmission) {
        try {
            admissionService.updateAdmission(id, updatedAdmission);
            return ResponseEntity.ok(Map.of("message", "Admission updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAdmission(@PathVariable Long id) {
        admissionService.deleteAdmission(id);
        return ResponseEntity.ok(Map.of("message", "Admission deleted successfully"));
    }
}
