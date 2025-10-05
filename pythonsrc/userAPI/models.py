from sqlalchemy import String, ForeignKey, Integer, DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from datetime import datetime
from uuid import UUID
from typing import Optional


class Base(DeclarativeBase):
    pass


class Person(Base):
    __tablename__ = "person"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(128))
    name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    surname: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    points: Mapped[int] = mapped_column(Integer)
    email: Mapped[str] = mapped_column(String(128), unique=True)
    role: Mapped[int] = mapped_column(Integer) # 0 = consumer, 1 = dispatcher, 2 = admin

class Distruption(Base):
    __tablename__ = "distruption"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("person.id"))
    title: Mapped[str] = mapped_column(String(128))
    description: Mapped[str] = mapped_column(String(512))
    location: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime)
    severity: Mapped[int] = mapped_column(Integer)
    file_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
