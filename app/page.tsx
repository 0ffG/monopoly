// app/page.tsx
"use client"; // Hook'ları (useState, useRouter) kullanmak için bu zorunludur.

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // next/navigation'dan import ediyoruz!

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [lobbyCode, setLobbyCode] = useState<string>('');

  const handleCreateLobby = async () => {
    try {
      const response = await fetch('/api/create-lobby', { method: 'POST' });
      const data = await response.json();
      if (data.lobbyId) {
        // Kurucunun ismini de query ile gönderelim.
        const hostName = prompt("Lütfen isminizi girin:", "Kurucu");
        if (hostName) {
           router.push(`/lobby/${data.lobbyId}?name=${encodeURIComponent(hostName)}`);
        }
      }
    } catch (error) {
      console.error("Lobi oluşturulurken hata:", error);
      alert("Lobi oluşturulamadı, lütfen tekrar deneyin.");
    }
  };

  const handleJoinLobby = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && lobbyCode) {
      router.push(`/lobby/${lobbyCode}?name=${encodeURIComponent(name)}`);
    }
  };

  return (
    <div>
      <h1>Monopoly Bankası</h1>
      <button onClick={handleCreateLobby}>Lobi Kur</button>
      <hr />
      <form onSubmit={handleJoinLobby}>
        <h2>Lobiye Katıl</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="İsminiz"
          required
        />
        <input
          type="text"
          value={lobbyCode}
          onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
          placeholder="Lobi Kodu"
          required
        />
        <button type="submit">Katıl</button>
      </form>
    </div>
  );
}