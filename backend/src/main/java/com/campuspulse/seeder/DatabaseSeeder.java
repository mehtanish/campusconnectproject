package com.campuspulse.seeder;

import com.campuspulse.model.*;
import com.campuspulse.model.enums.*;
import com.campuspulse.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ComplaintRepository complaintRepository;
    private final LostFoundItemRepository lostFoundItemRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded, skipping...");
            return;
        }

        log.info("🌱 Seeding database...");

        // ========== USERS ==========
        User student = userRepository.save(User.builder()
                .name("Arjun Sharma").email("arjun@pict.edu").rollNo("CS2024001")
                .passwordHash(passwordEncoder.encode("password123")).role(Role.STUDENT).build());

        User student2 = userRepository.save(User.builder()
                .name("Priya Patel").email("priya@pict.edu").rollNo("EC2024002")
                .passwordHash(passwordEncoder.encode("password123")).role(Role.STUDENT).build());

        User wifiAdmin = userRepository.save(User.builder()
                .name("Ravi Kumar").email("wifi.admin@pict.edu").rollNo("ADMIN001")
                .passwordHash(passwordEncoder.encode("admin123")).role(Role.ADMIN_WIFI).build());

        User maintAdmin = userRepository.save(User.builder()
                .name("Sunita Devi").email("maint.admin@pict.edu").rollNo("ADMIN002")
                .passwordHash(passwordEncoder.encode("admin123")).role(Role.ADMIN_MAINTENANCE).build());

        User messAdmin = userRepository.save(User.builder()
                .name("Ahmed Khan").email("mess.admin@pict.edu").rollNo("ADMIN003")
                .passwordHash(passwordEncoder.encode("admin123")).role(Role.ADMIN_MESS).build());

        User acadAdmin = userRepository.save(User.builder()
                .name("Dr. Meera Reddy").email("acad.admin@pict.edu").rollNo("ADMIN004")
                .passwordHash(passwordEncoder.encode("admin123")).role(Role.ADMIN_ACADEMIC).build());

        User superAdmin = userRepository.save(User.builder()
                .name("PICT Admin").email("super.admin@pict.edu").rollNo("SADMIN001")
                .passwordHash(passwordEncoder.encode("superadmin123")).role(Role.SUPER_ADMIN).build());

        log.info("✅ Seeded {} users", userRepository.count());

        // ========== CATEGORY HIERARCHY ==========

        // --- WiFi Issues ---
        Category wifi = saveCategory("WiFi Issues", null, Role.ADMIN_WIFI);
        Category hostelWifi = saveCategory("Hostel WiFi", wifi, Role.ADMIN_WIFI);
        saveCategory("Block A", hostelWifi, Role.ADMIN_WIFI);
        saveCategory("Block B", hostelWifi, Role.ADMIN_WIFI);
        saveCategory("Block C", hostelWifi, Role.ADMIN_WIFI);
        Category acadWifi = saveCategory("Academic WiFi", wifi, Role.ADMIN_WIFI);
        saveCategory("CSE Department", acadWifi, Role.ADMIN_WIFI);
        saveCategory("ECE Department", acadWifi, Role.ADMIN_WIFI);
        saveCategory("Library", acadWifi, Role.ADMIN_WIFI);
        saveCategory("Common Areas", acadWifi, Role.ADMIN_WIFI);

        // --- Maintenance ---
        Category maintenance = saveCategory("Maintenance", null, Role.ADMIN_MAINTENANCE);
        Category electrical = saveCategory("Electrical", maintenance, Role.ADMIN_MAINTENANCE);
        saveCategory("Hostel Rooms", electrical, Role.ADMIN_MAINTENANCE);
        saveCategory("Classrooms", electrical, Role.ADMIN_MAINTENANCE);
        saveCategory("Corridors", electrical, Role.ADMIN_MAINTENANCE);
        Category plumbing = saveCategory("Plumbing", maintenance, Role.ADMIN_MAINTENANCE);
        saveCategory("Hostel Washrooms", plumbing, Role.ADMIN_MAINTENANCE);
        saveCategory("Academic Block Washrooms", plumbing, Role.ADMIN_MAINTENANCE);
        Category furniture = saveCategory("Furniture", maintenance, Role.ADMIN_MAINTENANCE);
        saveCategory("Hostel Furniture", furniture, Role.ADMIN_MAINTENANCE);
        saveCategory("Classroom Furniture", furniture, Role.ADMIN_MAINTENANCE);

        // --- Mess / Food ---
        Category mess = saveCategory("Mess / Food", null, Role.ADMIN_MESS);
        saveCategory("Hygiene Issues", mess, Role.ADMIN_MESS);
        saveCategory("Food Quality", mess, Role.ADMIN_MESS);
        saveCategory("Menu Concerns", mess, Role.ADMIN_MESS);
        saveCategory("Timing Issues", mess, Role.ADMIN_MESS);

        // --- Academic ---
        Category academic = saveCategory("Academic", null, Role.ADMIN_ACADEMIC);
        Category classroom = saveCategory("Classroom Issues", academic, Role.ADMIN_ACADEMIC);
        saveCategory("Projector/AV", classroom, Role.ADMIN_ACADEMIC);
        saveCategory("AC/Ventilation", classroom, Role.ADMIN_ACADEMIC);
        saveCategory("Seating", classroom, Role.ADMIN_ACADEMIC);
        Category lab = saveCategory("Lab Issues", academic, Role.ADMIN_ACADEMIC);
        saveCategory("Computer Lab", lab, Role.ADMIN_ACADEMIC);
        saveCategory("Science Lab", lab, Role.ADMIN_ACADEMIC);
        saveCategory("Library Issues", academic, Role.ADMIN_ACADEMIC);

        log.info("✅ Seeded {} categories", categoryRepository.count());

        // ========== SAMPLE COMPLAINTS ==========
        // Find leaf category "Block A" under Hostel WiFi
        List<Category> blockAs = categoryRepository.findByParentId(hostelWifi.getId());
        Category blockA = blockAs.stream()
                .filter(c -> c.getName().equals("Block A"))
                .findFirst().orElse(hostelWifi);

        complaintRepository.save(Complaint.builder()
                .title("WiFi not working in Block A, 3rd Floor")
                .description("The WiFi has been down since yesterday evening. Multiple students affected. Cannot attend online classes.")
                .category(blockA)
                .locationPath("WiFi Issues > Hostel WiFi > Block A")
                .issueTag("no_connection")
                .student(student)
                .status(ComplaintStatus.PENDING)
                .upvoteCount(8)
                .priorityScore(8 * 1.5 + 1.0)
                .build());

        Category hygieneIssues = categoryRepository.findByParentId(mess.getId()).stream()
                .filter(c -> c.getName().equals("Hygiene Issues"))
                .findFirst().orElse(mess);

        complaintRepository.save(Complaint.builder()
                .title("Unhygienic conditions in Mess Kitchen")
                .description("Found insects near the food preparation area. This is a serious health hazard.")
                .category(hygieneIssues)
                .locationPath("Mess / Food > Hygiene Issues")
                .issueTag("insects_found")
                .student(student2)
                .status(ComplaintStatus.APPROVED)
                .upvoteCount(22)
                .priorityScore(22 * 1.5 + 1.0)
                .build());

        Category hostelPlumbing = categoryRepository.findByParentId(plumbing.getId()).stream()
                .filter(c -> c.getName().equals("Hostel Washrooms"))
                .findFirst().orElse(plumbing);

        complaintRepository.save(Complaint.builder()
                .title("Water leakage in Block B washroom")
                .description("Continuous water leakage from the ceiling in 2nd floor washroom. Floor is slippery and dangerous.")
                .category(hostelPlumbing)
                .locationPath("Maintenance > Plumbing > Hostel Washrooms")
                .issueTag("water_leakage")
                .student(student)
                .status(ComplaintStatus.IN_PROGRESS)
                .adminNote("Plumber has been dispatched. Expected fix by tomorrow.")
                .upvoteCount(5)
                .priorityScore(5 * 1.5 + 1.0)
                .build());

        log.info("✅ Seeded {} complaints", complaintRepository.count());

        // ========== SAMPLE LOST & FOUND ITEMS ==========
        lostFoundItemRepository.save(LostFoundItem.builder()
                .title("Blue HP Laptop Charger")
                .category("Electronics")
                .foundLocation("Library, 2nd Floor Study Area")
                .foundDate(LocalDate.now().minusDays(2))
                .hiddenDetails("Has a small dent on the adapter. Cable has yellow tape near the connector.")
                .status(ItemStatus.LISTED)
                .finder(student2)
                .build());

        lostFoundItemRepository.save(LostFoundItem.builder()
                .title("Student ID Card - Engineering Department")
                .category("Documents")
                .foundLocation("Cafeteria Near Counter 3")
                .foundDate(LocalDate.now().minusDays(1))
                .hiddenDetails("Card belongs to CSE department. Roll number starts with 2023.")
                .status(ItemStatus.LISTED)
                .finder(student)
                .build());

        lostFoundItemRepository.save(LostFoundItem.builder()
                .title("Black Umbrella with Wooden Handle")
                .category("Personal Items")
                .foundLocation("Main Auditorium, Row 5")
                .foundDate(LocalDate.now())
                .hiddenDetails("Has initials 'RK' carved on the handle. Slight tear on the canopy.")
                .status(ItemStatus.LISTED)
                .finder(student2)
                .build());

        log.info("✅ Seeded {} lost & found items", lostFoundItemRepository.count());
        log.info("🎉 Database seeding complete!");
        log.info("📋 Demo credentials:");
        log.info("   Student: arjun@campus.edu / password123");
        log.info("   WiFi Admin: wifi.admin@campus.edu / admin123");
        log.info("   Super Admin: super.admin@campus.edu / superadmin123");
    }

    private Category saveCategory(String name, Category parent, Role adminRole) {
        Category category = Category.builder()
                .name(name)
                .parent(parent)
                .adminRole(adminRole)
                .build();
        return categoryRepository.save(category);
    }
}
