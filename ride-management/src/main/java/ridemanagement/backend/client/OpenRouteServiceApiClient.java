package ridemanagement.backend.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import ridemanagement.backend.model.Point;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OpenRouteServiceApiClient {

    @Value("${openrouteservice.api.key}")
    private String apiKey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public OpenRouteServiceApiClient(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.baseUrl("https://api.openrouteservice.org").build();
        this.objectMapper = objectMapper;
    }

    /**
     * Dohvata rutu vožnje od OpenRouteService API-ja.
     *
     * @param coordinates Lista koordinata [longitude, latitude] za rutu (start, stop1, stop2..., destination).
     * @return Listu Point objekata koji predstavljaju dekodiranu putanju rute.
     * @throws IOException Ako dođe do greške prilikom parsiranja JSON-a.
     */
    public List<Point> getRoute(List<List<Double>> coordinates) throws IOException {
        Map<String, Object> body = Map.of("coordinates", coordinates);

        Mono<String> responseMono = webClient.post()
                .uri("/v2/directions/driving-car")
                .header("Authorization", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class);

        String jsonResponse = responseMono.block(); // Blokirajući poziv, razmisli o asinhronom pristupu za produkciju

        return parseRouteGeometry(jsonResponse);
    }

    /**
     * Parsira JSON odgovor iz OpenRouteService-a i dekodira poliline u listu Point objekata.
     *
     * @param jsonResponse JSON string odgovora.
     * @return Lista Point objekata koji predstavljaju dekodiranu putanju.
     * @throws IOException Ako dođe do greške prilikom parsiranja JSON-a.
     */
    private List<Point> parseRouteGeometry(String jsonResponse) throws IOException {
        JsonNode rootNode = objectMapper.readTree(jsonResponse);
        JsonNode routesNode = rootNode.path("routes");

        if (routesNode.isArray() && routesNode.size() > 0) {
            JsonNode geometryNode = routesNode.get(0).path("geometry");
            String encodedPolyline = geometryNode.asText();
            return decodePolyline(encodedPolyline);
        }
        return new ArrayList<>();
    }

    /**
     * Dekodira OpenRouteService-ov enkodirani poliline string u listu Point objekata.
     *
     * @param encodedPolyline Enkodirani poliline string.
     * @return Lista Point objekata.
     */
    private List<Point> decodePolyline(String encodedPolyline) {
        List<Point> poly = new ArrayList<>();
        int index = 0, len = encodedPolyline.length();
        int lat = 0, lng = 0;

        while (index < len) {
            int b, shift = 0, result = 0;
            do {
                b = encodedPolyline.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            int dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lat += dlat;

            shift = 0;
            result = 0;
            do {
                b = encodedPolyline.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            int dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lng += dlng;

            poly.add(new Point((double) lat / 1E5, (double) lng / 1E5));
        }
        return poly;
    }
}
