import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { DatasheetCreate, DatasheetRead } from '@crawl-monorepo/shared-contracts';

@Injectable()
export class DatasheetService {
  constructor(private prisma: PrismaService) {}

  async create(createDatasheetDto: DatasheetCreate): Promise<DatasheetRead> {
    const { addresses, phones, emails, ...datasheetData } = createDatasheetDto;

    const datasheet = await this.prisma.datasheet.create({
      data: {
        ...datasheetData,
        addresses: {
          create: addresses.map(address => ({
            street: address.street,
            city: address.city,
            state: address.state,
            zipCode: address.zip_code,
          })),
        },
        phones: {
          create: phones,
        },
        emails: {
          create: emails,
        },
      },
      include: {
        addresses: true,
        phones: true,
        emails: true,
      },
    });

    return this.mapToDatasheetRead(datasheet);
  }

  async findAll(): Promise<DatasheetRead[]> {
    const datasheets = await this.prisma.datasheet.findMany({
      include: {
        addresses: true,
        phones: true,
        emails: true,
      },
    });

    return datasheets.map(this.mapToDatasheetRead);
  }

  async findAllForUser(userId: number): Promise<DatasheetRead[]> {
    const datasheets = await this.prisma.datasheet.findMany({
      where: {
        userId: userId,
      },
      include: {
        addresses: true,
        phones: true,
        emails: true,
      },
    });

    return datasheets.map(this.mapToDatasheetRead);
  }

  async findOne(id: number): Promise<DatasheetRead | null> {
    const datasheet = await this.prisma.datasheet.findUnique({
      where: { id },
      include: {
        addresses: true,
        phones: true,
        emails: true,
      },
    });

    return datasheet ? this.mapToDatasheetRead(datasheet) : null;
  }

  async update(id: number, updateDatasheetDto: Partial<DatasheetCreate>): Promise<DatasheetRead> {
    const { addresses, phones, emails, ...datasheetData } = updateDatasheetDto;

    const datasheet = await this.prisma.datasheet.update({
      where: { id },
      data: {
        ...datasheetData,
        ...(addresses && {
          addresses: {
            deleteMany: {},
            create: addresses.map(address => ({
              street: address.street,
              city: address.city,
              state: address.state,
              zipCode: address.zip_code,
            })),
          },
        }),
        ...(phones && {
          phones: {
            deleteMany: {},
            create: phones,
          },
        }),
        ...(emails && {
          emails: {
            deleteMany: {},
            create: emails,
          },
        }),
      },
      include: {
        addresses: true,
        phones: true,
        emails: true,
      },
    });

    return this.mapToDatasheetRead(datasheet);
  }

  async remove(id: number): Promise<void> {
    await this.prisma.datasheet.delete({
      where: { id },
    });
  }

  private mapToDatasheetRead(datasheet: any): DatasheetRead {
    return {
      id: datasheet.id,
      firstName: datasheet.firstName,
      middleName: datasheet.middleName,
      lastName: datasheet.lastName,
      age: datasheet.age,
      userId: datasheet.userId,
      addresses: datasheet.addresses.map((address: any) => ({
        id: address.id,
        street: address.street,
        city: address.city,
        state: address.state,
        zip_code: address.zipCode,
      })),
      phones: datasheet.phones.map((phone: any) => ({
        id: phone.id,
        number: phone.number,
        type: phone.type,
      })),
      emails: datasheet.emails.map((email: any) => ({
        id: email.id,
        address: email.address,
        type: email.type,
      })),
    };
  }
}