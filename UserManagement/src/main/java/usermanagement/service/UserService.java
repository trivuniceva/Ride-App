package usermanagement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import usermanagement.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
}
