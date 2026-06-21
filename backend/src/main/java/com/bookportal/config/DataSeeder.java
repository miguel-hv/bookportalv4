package com.bookportal.config;

import com.bookportal.entity.BookReview;
import com.bookportal.entity.User;
import com.bookportal.repository.BookReviewRepository;
import com.bookportal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Profile("dev")
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final List<String> USER_NAMES = List.of("alice", "bob", "carol", "dave", "eve");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final BookReviewRepository bookReviewRepository;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder, BookReviewRepository bookReviewRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.bookReviewRepository = bookReviewRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        for (String name : USER_NAMES) {
            User user = new User(name, passwordEncoder.encode("123"));
            userRepository.save(user);
            log.info("Seeded user: {}", name);
        }

        List<User> users = userRepository.findAll();

        List<String> bookTitles = List.of(
                "Cien años de soledad",
                "Don Quijote de la Mancha",
                "La sombra del viento",
                "El amor en los tiempos del cólera",
                "Rayuela"
        );

        List<String> reviewTexts = List.of(
                "Una obra maestra de la literatura universal.",
                "Una aventura inolvidable llena de humor y crítica social.",
                "Un misterio fascinante que atrapa desde la primera página.",
                "Una historia de amor profunda y conmovedora.",
                "Una novela experimental que desafía al lector."
        );

        for (int i = 0; i < users.size(); i++) {
            BookReview review = new BookReview();
            review.setBookTitle(bookTitles.get(i));
            review.setReviewText(reviewTexts.get(i));
            review.setUser(users.get(i));
            bookReviewRepository.save(review);
            log.info("Seeded review: {} by {}", review.getBookTitle(), users.get(i).getName());
        }
    }
}
