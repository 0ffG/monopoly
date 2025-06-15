// party/server.ts
import type * as Party from "partykit/server";

// Veri yapıları için tipleri tanımlayalım
interface Player {
  id: string;
  name: string;
}

type LobbyMessage =
  | { type: "join"; name: string }
  | { type: "kick"; playerId: string };

type LobbyState = {
  players: Player[];
  hostId: string | null;
};

export default class LobbyServer implements Party.Server {
  // Lobi durumunu tek bir state nesnesinde tutalım
  state: LobbyState = {
    players: [],
    hostId: null,
  };

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    // Lobiye bağlanan ilk kişiyse, onu "host" (kurucu) yap.
    if (this.state.players.length === 0) {
      this.state.hostId = conn.id;
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    const msg = JSON.parse(message) as LobbyMessage;

    if (msg.type === "join") {
      // Aynı ID'ye sahip oyuncu zaten varsa ekleme
      if (!this.state.players.some(p => p.id === sender.id)) {
        this.state.players.push({ id: sender.id, name: msg.name });
      }
    }

    if (msg.type === "kick" && sender.id === this.state.hostId) {
      this.state.players = this.state.players.filter(p => p.id !== msg.playerId);
    }
    
    // Herhangi bir değişiklikten sonra güncel durumu herkese yayınla
    this.broadcastUpdate();
  }

  onClose(conn: Party.Connection) {
    // Bir oyuncu bağlantısını kaybettiğinde listeden çıkar
    this.state.players = this.state.players.filter(p => p.id !== conn.id);
    this.broadcastUpdate();
  }
  
  // Güncel durumu yayınlayan yardımcı fonksiyon
  broadcastUpdate() {
    this.room.broadcast(JSON.stringify({
      type: "update",
      state: this.state
    }));
  }
}