package backend.rideapp;

import com.rideapp.usermanagement.UserManagementApplication;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import ridemanagement.backend.RideManagementApplication;

@SpringBootApplication
@EnableAsync
@EnableTransactionManagement
@Import({UserManagementApplication.class, RideManagementApplication.class})
public class RideAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(RideAppApplication.class, args);
    }
}
