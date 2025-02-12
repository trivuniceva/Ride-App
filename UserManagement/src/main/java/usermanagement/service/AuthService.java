package usermanagement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import usermanagement.repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserService userService;

    public User login(String email, String password) {
        System.out.println("email: " + email);
        System.out.println("password: " + password);

        User user = userService.getUserByEmail(email);
        if (user != null && userService.validPassword(user, password)) {
                System.out.println("dobar korisnik: " + user.getProfilePic());
                return user;
        }
        return null;
    }

}
