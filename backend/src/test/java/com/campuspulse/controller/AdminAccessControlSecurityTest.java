package com.campuspulse.controller;

import com.campuspulse.dto.auth.LoginRequest;
import com.campuspulse.dto.complaint.StatusUpdateRequest;
import com.campuspulse.model.Complaint;
import com.campuspulse.model.enums.ComplaintStatus;
import com.campuspulse.repository.ComplaintRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AdminAccessControlSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ComplaintRepository complaintRepository;

    private String studentToken;
    private String adminToken;
    private UUID testComplaintId;

    @BeforeEach
    void setUp() throws Exception {
        // Authenticate student
        LoginRequest studentLogin = new LoginRequest();
        studentLogin.setEmail("arjun@pict.edu");
        studentLogin.setPassword("password123");

        MvcResult studentResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> studentBody = objectMapper.readValue(studentResult.getResponse().getContentAsString(), Map.class);
        studentToken = (String) studentBody.get("token");

        // Authenticate admin
        LoginRequest adminLogin = new LoginRequest();
        adminLogin.setEmail("super.admin@pict.edu");
        adminLogin.setPassword("superadmin123");

        MvcResult adminResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> adminBody = objectMapper.readValue(adminResult.getResponse().getContentAsString(), Map.class);
        adminToken = (String) adminBody.get("token");

        // Grab any complaint
        Complaint c = complaintRepository.findAll().stream().findFirst().orElse(null);
        if (c != null) {
            testComplaintId = c.getId();
        }
    }

    @Test
    void studentIsBlockedFromAdminComplaintsEndpoint() throws Exception {
        // Student token to /api/admin/complaints must return 403 Forbidden
        mockMvc.perform(get("/api/admin/complaints")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void studentIsBlockedFromAdminStatsEndpoint() throws Exception {
        // Student token to /api/admin/stats must return 403 Forbidden
        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void studentIsBlockedFromAdminStatusPatch() throws Exception {
        if (testComplaintId == null) return;
        StatusUpdateRequest update = new StatusUpdateRequest();
        update.setStatus(ComplaintStatus.RESOLVED);
        update.setAdminNote("Malicious student note");

        // Student token to /api/admin/complaints/{id}/status must return 403 Forbidden
        mockMvc.perform(patch("/api/admin/complaints/" + testComplaintId + "/status")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isForbidden());

        // Student token to /api/complaints/{id}/status must also return 403 Forbidden
        mockMvc.perform(patch("/api/complaints/" + testComplaintId + "/status")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isForbidden());
    }

    @Test
    void studentIsBlockedFromAdminComplaintDeletion() throws Exception {
        if (testComplaintId == null) return;
        mockMvc.perform(delete("/api/admin/complaints/" + testComplaintId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void studentIsBlockedFromAllComplaintsListing() throws Exception {
        mockMvc.perform(get("/api/complaints")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void unauthenticatedUserIsBlockedFromAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/complaints"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminCanAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/complaints")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    void adminAcceptComplaintPersistsAndIsIdempotent() throws Exception {
        Complaint complaint = complaintRepository.findAll().stream()
                .findFirst().orElse(null);
        assertThat(complaint).isNotNull();

        StatusUpdateRequest update = new StatusUpdateRequest();
        update.setStatus(ComplaintStatus.ACCEPTED);

        // First Accept call
        MvcResult r1 = mockMvc.perform(
                patch("/api/admin/complaints/" + complaint.getId() + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andReturn();

        // Second duplicate / concurrent Accept call (idempotent, must return 200, no false conflict)
        MvcResult r2 = mockMvc.perform(
                patch("/api/admin/complaints/" + complaint.getId() + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andReturn();

        // Verify status persisted in database
        Complaint persisted = complaintRepository.findById(complaint.getId()).orElse(null);
        assertThat(persisted).isNotNull();
        assertThat(persisted.getStatus()).isEqualTo(ComplaintStatus.ACCEPTED);
    }
}
