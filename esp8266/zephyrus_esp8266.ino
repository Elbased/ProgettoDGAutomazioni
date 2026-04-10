#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>

// Sostituisci con le credenziali della tua rete Wi-Fi
const char *ssid = "paolo's X7 pro";
const char *password = "phlox0000";

// Server WebSocket sulla porta 81
WebSocketsServer webSocket = WebSocketsServer(81);

// Il pulsante "Flash" sulla maggior parte dei NodeMCU/Wemos è collegato al GPIO
// 0
const int BUTTON_PIN = 0;

// Pin potenziometro (collegato all'ADC — A0 su ESP8266)
const int POT_PIN = A0;

// Variabili per il debouncing del pulsante
unsigned long lastDebounceTime =
    0; // L'ultimo momento in cui il potenziale output è cambiato
unsigned long debounceDelay = 50; // Tempo di debounce (in ms)
int buttonState;                  // Lo stato attuale rilevato dal pin di input
int lastButtonState = HIGH; // Il precedente stato rilevato dal pin di input
                            // (HIGH per via del pull-up)

// Variabili per il potenziometro
int lastPotValue = -1;
unsigned long lastPotSendTime = 0;
const unsigned long POT_SEND_INTERVAL = 250; // Invia ogni 250ms max

void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload,
                    size_t length) {
  switch (type) {
  case WStype_DISCONNECTED:
    Serial.printf("[%u] Disconnected!\n", num);
    break;
  case WStype_CONNECTED: {
    IPAddress ip = webSocket.remoteIP(num);
    Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0],
                  ip[1], ip[2], ip[3], (const char *)payload);
    break;
  }
  case WStype_TEXT:
    Serial.printf("[%u] get Text: %s\n", num, (const char *)payload);
    // Puoi gestire eventuali messaggi in ingresso qui
    break;
  default:
    break;
  }
}

void setup() {
  Serial.begin(9600);
  delay(10);

  // Configura il pin del pulsante con la resistenza di pull-up interna
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  // Connessione alla rete Wi-Fi
  Serial.println();
  Serial.print("Connessione a: ");
  Serial.println(ssid);

  // Impostalo come "Stazione" (Client)
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("Wi-Fi connesso!");
  Serial.print("Indirizzo IP per il browser: ");
  Serial.println(WiFi.localIP());

  // Avvia il server WebSocket e connettile all'evento
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  // Mantieni vivi i WebSocket
  webSocket.loop();

  // Lettura e debouncing del pulsante
  int reading = digitalRead(BUTTON_PIN);

  // Se lo stato dell'interruttore è cambiato, a causa di rimbalzo o pressione
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }

  if ((millis() - lastDebounceTime) > debounceDelay) {
    // Se la lettura è rimasta stabile più a lungo del tempo di debounce

    // Se lo stato è cambiato fisicamente
    if (reading != buttonState) {
      buttonState = reading;

      // Se il nuovo stato è LOW (pulsante premuto)
      if (buttonState == LOW) {
        Serial.println(
            "Pulsante FLASH premuto! Inoltro evento di SPIKE ai client...");
        // Invia ad *tutti* i client connessi un pacchetto in formato JSON
        webSocket.broadcastTXT("{\"action\":\"spike\"}");
      }
    }
  }

  // Salva l'ultima lettura per il prossimo ciclo
  lastButtonState = reading;

  // ===== Lettura potenziometro =====
  if (millis() - lastPotSendTime >= POT_SEND_INTERVAL) {
    int rawPot = analogRead(POT_PIN); // 0-1023 su ESP8266
    // Mappa a percentuale 0-100
    int potPercent = map(rawPot, 0, 1023, 0, 100);

    // Invia solo se il valore è cambiato di almeno 2%
    if (abs(potPercent - lastPotValue) >= 2) {
      lastPotValue = potPercent;
      lastPotSendTime = millis();

      // Invia il valore del potenziometro come JSON
      char json[64];
      snprintf(json, sizeof(json),
               "{\"action\":\"potentiometer\",\"value\":%d}", potPercent);
      webSocket.broadcastTXT(json);
      Serial.printf("Potenziometro: %d%%\n", potPercent);
    }
  }
}
