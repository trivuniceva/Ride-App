package usermanagement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import usermanagement.repository.UserRepository;
import usermanagement.model.User;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;


    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean userExist(String email) {
        return userRepository.findByEmail(email) != null;
    }

    public boolean validPassword(User user, String password) {
        return user.getPassword().equals(password);
    }




}
