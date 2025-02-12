package backend.rideapp;

import com.rideapp.usermanagement.UserManagementApplication;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@Import(UserManagementApplication.class)
public class RideAppApplication {

    public static void main(String[] args) {

        SpringApplication.run(RideAppApplication.class, args);
//        SpringApplication.run(UserManagementApplication.class, args);
    }
}
