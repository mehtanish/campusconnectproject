package com.campuspulse.seeder;

import com.campuspulse.model.*;
import com.campuspulse.model.enums.*;
import com.campuspulse.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;



@Component
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ComplaintRepository complaintRepository;
    private final IssueTypeRepository issueTypeRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.demo-data:true}")
    private boolean seedDemoData;

    @Value("${app.bootstrap-admin.email:}")
    private String bootstrapAdminEmail;

    @Value("${app.bootstrap-admin.roll-no:}")
    private String bootstrapAdminRollNo;

    @Value("${app.bootstrap-admin.password:}")
    private String bootstrapAdminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        // Always seed issue types if the table is empty — independent of other data.
        // This handles existing databases that predate the controlled-vocabulary feature.
        if (issueTypeRepository.count() == 0) {
            log.info("🏷️  Seeding controlled-vocabulary issue types...");
            seedIssueTypes();
            log.info("✅ Seeded {} issue types", issueTypeRepository.count());
        }

        if (userRepository.count() > 0) {
            log.info("Database already seeded, skipping...");
            return;
        }

        log.info("🌱 Seeding PICT Campus Infrastructure Data...");

        // ========== USERS ==========
        User student = null;
        User student2 = null;
        if (seedDemoData) {
            student = userRepository.save(User.builder()
                .name("Arjun Sharma").email("arjun@pict.edu").rollNo("F2510342")
                .passwordHash(passwordEncoder.encode("password123")).role(Role.STUDENT).build());

            student2 = userRepository.save(User.builder()
                .name("Priya Patel").email("priya@pict.edu").rollNo("F2510343")
                .passwordHash(passwordEncoder.encode("password123")).role(Role.STUDENT).build());

            userRepository.save(User.builder()
                .name("Ravi Kumar").email("wifi.admin@pict.edu").rollNo("ADMIN001")
                .passwordHash(passwordEncoder.encode("admin123")).role(Role.ADMIN_WIFI).build());

            userRepository.save(User.builder()
                .name("Sunita Devi").email("maint.admin@pict.edu").rollNo("ADMIN002")
                .passwordHash(passwordEncoder.encode("admin123")).role(Role.ADMIN_MAINTENANCE).build());

            userRepository.save(User.builder()
                .name("Ahmed Khan").email("mess.admin@pict.edu").rollNo("ADMIN003")
                .passwordHash(passwordEncoder.encode("admin123")).role(Role.ADMIN_MESS).build());

            userRepository.save(User.builder()
                .name("Dr. Meera Reddy").email("acad.admin@pict.edu").rollNo("ADMIN004")
                .passwordHash(passwordEncoder.encode("admin123")).role(Role.ADMIN_ACADEMIC).build());

            userRepository.save(User.builder()
                .name("PICT Admin").email("super.admin@pict.edu").rollNo("SADMIN001")
                .passwordHash(passwordEncoder.encode("superadmin123")).role(Role.SUPER_ADMIN).build());
            log.info("Seeded {} development users", userRepository.count());
        } else {
            if (bootstrapAdminEmail.isBlank() || bootstrapAdminRollNo.isBlank()
                || bootstrapAdminPassword.isBlank()) {
            throw new IllegalStateException(
                "Set BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_ROLL_NO, and BOOTSTRAP_ADMIN_PASSWORD "
                    + "when initializing an empty production database");
            }

            userRepository.save(User.builder()
                .name("CampusPulse Administrator")
                .email(bootstrapAdminEmail.trim().toLowerCase(java.util.Locale.ROOT))
                .rollNo(bootstrapAdminRollNo.trim())
                .passwordHash(passwordEncoder.encode(bootstrapAdminPassword))
                .role(Role.SUPER_ADMIN)
                .build());
            log.info("Created production bootstrap administrator");
        }

        // ========== EXACT PICT CAMPUS CATEGORY HIERARCHY ==========

        // 1. ACADEMIC BLOCKS (A1, A2, A3, F1)
        Category academicBlocks = saveCategory("Academic Blocks", null, Role.ADMIN_ACADEMIC);
        
        // A1 Building (5 Floors)
        Category a1 = saveCategory("A1 Building", academicBlocks, Role.ADMIN_ACADEMIC);
        createFloorStructure(a1, 5, true, Role.ADMIN_ACADEMIC);

        // A2 Building (4 Floors)
        Category a2 = saveCategory("A2 Building", academicBlocks, Role.ADMIN_ACADEMIC);
        createFloorStructure(a2, 4, true, Role.ADMIN_ACADEMIC);

        // A3 Building (5 Floors)
        Category a3 = saveCategory("A3 Building", academicBlocks, Role.ADMIN_ACADEMIC);
        createFloorStructure(a3, 5, true, Role.ADMIN_ACADEMIC);

        // F1 Building (3 Floors)
        Category f1 = saveCategory("F1 Building", academicBlocks, Role.ADMIN_ACADEMIC);
        createFloorStructure(f1, 3, true, Role.ADMIN_ACADEMIC);

        // 2. LIBRARIES
        Category libraryCat = saveCategory("Library & Study Infrastructure", null, Role.ADMIN_ACADEMIC);
        saveCategory("Central Library (Books & Reading Hall)", libraryCat, Role.ADMIN_ACADEMIC);
        saveCategory("Digital Library (WiFi & Systems)", libraryCat, Role.ADMIN_WIFI);

        // 3. MESS & CANTEEN (4 Floors, Food & Hygiene Only)
        Category messCat = saveCategory("Mess & Food Services", null, Role.ADMIN_MESS);
        Category canteen = saveCategory("Campus Canteen", messCat, Role.ADMIN_MESS);
        saveCategory("Food Quality / Taste", canteen, Role.ADMIN_MESS);
        saveCategory("Hygiene & Cleanliness", canteen, Role.ADMIN_MESS);

        Category regularMess = saveCategory("Regular Student Mess (4 Floors)", messCat, Role.ADMIN_MESS);
        for (int i = 1; i <= 4; i++) {
            Category messFloor = saveCategory("Floor " + i, regularMess, Role.ADMIN_MESS);
            saveCategory("Food Quality & Taste", messFloor, Role.ADMIN_MESS);
            saveCategory("Kitchen Hygiene", messFloor, Role.ADMIN_MESS);
            saveCategory("Serving & Utensils", messFloor, Role.ADMIN_MESS);
            saveCategory("Timing & Service Speed", messFloor, Role.ADMIN_MESS);
        }

        // 4. HOSTELS (Boys Hostel & Girls Hostel)
        Category hostelCat = saveCategory("Campus Hostels", null, Role.ADMIN_MAINTENANCE);

        // Boys Hostel (5 Floors, 77 Rooms: 101-117, 201-217, 301-317, 401-417, 501-509 + Dispensary)
        Category boysHostel = saveCategory("Boys Hostel", hostelCat, Role.ADMIN_MAINTENANCE);
        saveCategory("Ground Floor - Dispensary / Medical Office", boysHostel, Role.ADMIN_MAINTENANCE);
        saveCategory("Ground Floor - Common Washrooms", boysHostel, Role.ADMIN_MAINTENANCE);
        saveCategory("Ground Floor - Water Purifier / Cooler", boysHostel, Role.ADMIN_MAINTENANCE);

        for (int floor = 1; floor <= 5; floor++) {
            Category bFloor = saveCategory("Floor " + floor, boysHostel, Role.ADMIN_MAINTENANCE);
            saveCategory("Floor " + floor + " - Washrooms & Plumbing", bFloor, Role.ADMIN_MAINTENANCE);
            saveCategory("Floor " + floor + " - WiFi Router / Connectivity", bFloor, Role.ADMIN_WIFI);
            Category bRooms = saveCategory("Floor " + floor + " - Rooms", bFloor, Role.ADMIN_MAINTENANCE);
            
            int maxRoom = (floor == 5) ? 9 : 17;
            for (int r = 1; r <= maxRoom; r++) {
                int roomNo = (floor * 100) + r;
                saveCategory("Room " + roomNo, bRooms, Role.ADMIN_MAINTENANCE);
            }
        }

        // Girls Hostel (7 Floors: Ground to 3rd = 40 Rooms [001-030 & 101-130...], 4th to 7th = 40 Rooms)
        Category girlsHostel = saveCategory("Girls Hostel", hostelCat, Role.ADMIN_MAINTENANCE);
        for (int floor = 0; floor <= 7; floor++) {
            String floorLabel = (floor == 0) ? "Ground Floor" : "Floor " + floor;
            Category gFloor = saveCategory(floorLabel, girlsHostel, Role.ADMIN_MAINTENANCE);
            saveCategory(floorLabel + " - Washrooms & Cleaning", gFloor, Role.ADMIN_MAINTENANCE);
            saveCategory(floorLabel + " - WiFi Router / Network", gFloor, Role.ADMIN_WIFI);
            Category gRooms = saveCategory(floorLabel + " - Rooms", gFloor, Role.ADMIN_MAINTENANCE);

            int startRoom = floor * 100 + 1;
            int endRoom = startRoom + (floor <= 3 ? 10 : 8); // Seed prominent rooms
            for (int r = startRoom; r <= endRoom; r++) {
                String rStr = String.format("%03d", r);
                saveCategory("Room " + rStr, gRooms, Role.ADMIN_MAINTENANCE);
            }
        }

        // 5. SECURITY & GATE
        Category securityCat = saveCategory("Security & Gate Guards", null, Role.ADMIN_MAINTENANCE);
        saveCategory("Main Gate Security Desk", securityCat, Role.ADMIN_MAINTENANCE);
        saveCategory("Hostel Security Desk", securityCat, Role.ADMIN_MAINTENANCE);

        log.info("✅ Seeded {} PICT campus categories", categoryRepository.count());

        if (seedDemoData) {
            Category a3Floor1Washroom = categoryRepository.findAll().stream()
                .filter(c -> c.getName().contains("Washroom") && c.getParent() != null
                    && c.getParent().getName().contains("Floor 1"))
                .findFirst().orElse(academicBlocks);

            complaintRepository.save(Complaint.builder()
                .title("A3 Building - Floor 1 Gents Washroom Dirty & Water Supply Issue")
                .description("The Gents washroom on Floor 1 of A3 building is dirty and water flush is not working since morning.")
                .category(a3Floor1Washroom)
                .locationPath("Academic Blocks > A3 Building > Floor 1 > Gents Washroom")
                .issueTag("unclean-hygiene")
                .student(student)
                .status(ComplaintStatus.PENDING)
                .upvoteCount(14)
                .priorityScore(14 * 1.5 + 1.0)
                .build());

            Category boysRoom105 = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equals("Room 105"))
                .findFirst().orElse(boysHostel);

            complaintRepository.save(Complaint.builder()
                .title("Boys Hostel Room 105 - WiFi Router Disconnected")
                .description("Router in Room 105 has orange light blinking. High latency and no internet access.")
                .category(boysRoom105)
                .locationPath("Campus Hostels > Boys Hostel > Floor 1 > Floor 1 - Rooms > Room 105")
                .issueTag("router-hardware")
                .student(student2)
                .status(ComplaintStatus.APPROVED)
                .upvoteCount(6)
                .priorityScore(6 * 1.5 + 1.0)
                .build());

            log.info("✅ Seeded sample complaints");
        }
    }

    private void seedIssueTypes() {
        List<IssueType> types = List.of(
            // ----- wifi -----
            it("wifi", "no-connectivity",        "No connectivity"),
            it("wifi", "slow-speed",             "Slow speed"),
            it("wifi", "frequent-disconnects",   "Frequent disconnects"),
            it("wifi", "router-hardware",        "Router / hardware issue"),

            // ----- washroom -----
            it("washroom", "unclean-hygiene",    "Unclean / hygiene issue"),
            it("washroom", "no-water",           "No water supply"),
            it("washroom", "plumbing-leak",      "Plumbing / water leakage"),
            it("washroom", "door-lock",          "Door / lock broken"),

            // ----- mess -----
            it("mess", "food-quality",           "Food quality / taste"),
            it("mess", "hygiene",                "Hygiene / cleanliness"),
            it("mess", "timing-availability",    "Timing / availability"),
            it("mess", "utensils-dirty",         "Dirty utensils / serving issue"),

            // ----- academic -----
            it("academic", "projector-av",       "Projector / AV malfunction"),
            it("academic", "furniture-damaged",  "Broken bench / desk / chair"),
            it("academic", "lighting",           "Lighting / tube light"),
            it("academic", "ac-fan",             "AC / fan not working"),

            // ----- maintenance -----
            it("maintenance", "electrical",      "Electrical fault"),
            it("maintenance", "water-supply",    "Water supply issue"),
            it("maintenance", "structural",      "Structural / civil damage"),
            it("maintenance", "pest",            "Pest / infestation"),

            // ----- security -----
            it("security", "gate-incident",      "Gate / entry incident"),
            it("security", "unauthorised-entry", "Unauthorised entry"),
            it("security", "staff-behaviour",    "Staff behaviour concern"),
            it("security", "cctv",               "CCTV / surveillance issue"),

            // ----- general -----
            it("general", "other",               "Other general issue")
        );
        issueTypeRepository.saveAll(types);
    }

    /** Convenience builder for IssueType seeds */
    private static IssueType it(String groupKey, String stableKey, String displayLabel) {
        return IssueType.builder()
                .groupKey(groupKey)
                .stableKey(stableKey)
                .displayLabel(displayLabel)
                .build();
    }

    private void createFloorStructure(Category building, int floors, boolean hasWashrooms, Role role) {
        for (int i = 1; i <= floors; i++) {
            Category floorCat = saveCategory("Floor " + i, building, role);
            saveCategory("Classrooms & Labs", floorCat, role);
            if (hasWashrooms) {
                saveCategory("Gents Washroom", floorCat, role);
                saveCategory("Ladies Washroom", floorCat, role);
            }
            saveCategory("Corridor & Lighting", floorCat, role);
            saveCategory("WiFi Access Point", floorCat, Role.ADMIN_WIFI);
        }
    }

    private Category saveCategory(String name, Category parent, Role adminRole) {
        Role effectiveRole = (adminRole != null) ? adminRole : (parent != null ? parent.getAdminRole() : Role.SUPER_ADMIN);
        Category category = Category.builder()
                .name(name)
                .parent(parent)
                .adminRole(effectiveRole)
                .build();
        return categoryRepository.save(category);
    }

}
