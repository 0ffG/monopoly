// app/lobby/[lobbyId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import usePartySocket from 'partysocket/react';

// Paylaşılan tipleri tanımla (veya ayrı bir types.ts dosyasından import et)
interface Player {
  id: string;
  name: string;
}

interface LobbyState {
  players: Player[];
  hostId: string | null;
}

export default function LobbyPage({ params }: { params: { lobbyId: string } }) {
  const searchParams = useSearchParams();
  const name = searchParams.get('name'); // Query parametresini bu hook ile alıyoruz.

  const [lobbyState, setLobbyState] = useState<LobbyState>({ players: [], hostId: null });

  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!, // .env.local dosyasından okumak en iyisi
    room: params.lobbyId,
  });

  const myId = socket?.id;

  // Lobiye katılma mesajı gönderme
  useEffect(() => {
    if (socket && name) {
      socket.send(JSON.stringify({ type: 'join', name }));
    }
  }, [socket, name]);

  // Sunucudan gelen güncellemeleri dinleme
  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'update') {
          setLobbyState(msg.state);
        }
      };
    }
  }, [socket]);

  const kickPlayer = (playerId: string) => {
    if (socket) {
      socket.send(JSON.stringify({ type: 'kick', playerId }));
    }
  };

  const isHost = myId === lobbyState.hostId;

  return (
    <div>
      <h1>Lobi: {params.lobbyId}</h1>
      <p>Oyunun başlaması bekleniyor...</p>
      
      <h2>Oyuncular ({lobbyState.players.length})</h2>
      <ul>
        {lobbyState.players.map((player) => (
          <li key={player.id}>
            {player.name} {player.id === lobbyState.hostId ? '👑 (Kurucu)' : ''}
            {isHost && player.id !== myId && (
              <button onClick={() => kickPlayer(player.id)} style={{ marginLeft: '10px' }}>
                At
              </button>
            )}
          </li>
        ))}
      </ul>
      
      {isHost && lobbyState.players.length > 1 && (
        <button style={{marginTop: "20px", padding: "10px 20px"}}>
            Oyunu Başlat
        </button>
      )}
    </div>
  );
}