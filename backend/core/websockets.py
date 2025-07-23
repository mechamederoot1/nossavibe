"""
Gerenciador de WebSockets
"""
import json
from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message)
                except:
                    self.active_connections[user_id].remove(connection)

    async def send_notification(self, user_id: int, notification: dict):
        message = json.dumps({
            "type": "notification",
            **notification
        })
        await self.send_personal_message(message, user_id)

    async def send_message(self, user_id: int, message_data: dict):
        """Enviar mensagem em tempo real"""
        message = json.dumps({
            "type": "message",
            **message_data
        })
        await self.send_personal_message(message, user_id)

    async def send_typing_indicator(self, user_id: int, typing_data: dict):
        """Enviar indicador de digitação"""
        message = json.dumps({
            "type": "typing",
            **typing_data
        })
        await self.send_personal_message(message, user_id)

    async def send_message_read(self, user_id: int, read_data: dict):
        """Notificar que mensagem foi lida"""
        message = json.dumps({
            "type": "message_read",
            **read_data
        })
        await self.send_personal_message(message, user_id)

# Instância global do manager
manager = ConnectionManager()
