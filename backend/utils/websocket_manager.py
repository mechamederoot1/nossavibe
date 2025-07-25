from fastapi import WebSocket
from typing import Dict, List, Union
import jwt
import json
from core.config import SECRET_KEY, ALGORITHM
from core.database import SessionLocal
from models import User

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"User {user_id} connected. Total connections: {len(self.active_connections[user_id])}")

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
                print(f"User {user_id} disconnected. Remaining connections: {len(self.active_connections[user_id])}")
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                print(f"All connections for user {user_id} removed")

    async def send_personal_message(self, message: Union[str, dict], user_id: int):
        """Enviar mensagem para um usuário específico"""
        if user_id in self.active_connections:
            message_str = json.dumps(message) if isinstance(message, dict) else message

            connections_to_remove = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message_str)
                except Exception as e:
                    print(f"Failed to send message to user {user_id}: {e}")
                    connections_to_remove.append(connection)

            # Remove conexões inválidas
            for connection in connections_to_remove:
                self.active_connections[user_id].remove(connection)

            return True
        else:
            print(f"User {user_id} not connected")
            return False

    async def send_notification(self, notification_data: dict, user_id: int):
        """Enviar notificação específica para um usuário"""
        message = {
            "type": "notification",
            "data": notification_data
        }
        return await self.send_personal_message(message, user_id)

    async def broadcast(self, message: Union[str, dict]):
        """Enviar mensagem para todos os usuários conectados"""
        message_str = json.dumps(message) if isinstance(message, dict) else message

        users_to_clean = []
        for user_id, connections in self.active_connections.items():
            connections_to_remove = []
            for connection in connections:
                try:
                    await connection.send_text(message_str)
                except:
                    connections_to_remove.append(connection)

            # Remove conexões inválidas
            for connection in connections_to_remove:
                connections.remove(connection)

            if not connections:
                users_to_clean.append(user_id)

        # Remove usuários sem conexões
        for user_id in users_to_clean:
            del self.active_connections[user_id]

    def is_user_connected(self, user_id: int) -> bool:
        """Verificar se um usuário está conectado"""
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0

manager = ConnectionManager()

def verify_websocket_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.email == email).first()
            return user
        finally:
            db.close()
    except jwt.PyJWTError:
        return None
