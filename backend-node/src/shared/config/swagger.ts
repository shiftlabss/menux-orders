import swaggerJsdoc from 'swagger-jsdoc';
import { config } from '@shared/config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Menux API',
      version: '1.0.0',
      description: 'API Documentation for Menux Backend',
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/v1`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string' },
            requestId: { type: 'string' },
          },
        },
        UserResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string' },
            restaurantId: { type: 'string', format: 'uuid' },
            jobTitle: { type: 'string' },
            phone: { type: 'string' },
            avatarUrl: { type: 'string' },
          },
        },
        RestaurantResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            slug: { type: 'string' },
            tradingName: { type: 'string' },
            corporateName: { type: 'string' },
            cnpj: { type: 'string' },
            logoUrl: { type: 'string' },
            description: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            address: { type: 'string' },
            openingHours: { type: 'string' },
            instagram: { type: 'string' },
            facebook: { type: 'string' },
            whatsapp: { type: 'string' },
            website: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },
        CategoryResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            order: { type: 'integer' },
            isActive: { type: 'boolean' },
            pai: { type: 'string', format: 'uuid', nullable: true },
            restaurantId: { type: 'string', format: 'uuid' },
          },
        },
        WaiterResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            nickname: { type: 'string', nullable: true },
            avatarUrl: { type: 'string', nullable: true },
            pinCode: { type: 'string' },
            restaurantId: { type: 'string', format: 'uuid' },
          },
        },
        OrderResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            code: { type: 'string' },
            status: { type: 'string', enum: ['WAITING', 'PREPARING', 'READY', 'DELIVERED', 'FINISHED', 'CANCELED'] },
            total: { type: 'number' },
            customerId: { type: 'string', format: 'uuid', nullable: true },
            tableNumber: { type: 'string', nullable: true },
            restaurantId: { type: 'string', format: 'uuid', nullable: true },
            waiterId: { type: 'string', format: 'uuid', nullable: true },
            tableId: { type: 'string', format: 'uuid', nullable: true },
          },
        },
        CustomerResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email', nullable: true },
            phone: { type: 'string', nullable: true },
            customer_type: { type: 'string', enum: ['registered', 'anonymous'] },
            since: { type: 'string', format: 'date-time' },
            metrics: {
              type: 'object',
              properties: {
                totalSpent: { type: 'number' },
                totalOrders: { type: 'integer' },
                lastOrderDate: { type: 'string', format: 'date-time', nullable: true },
                ticketAverage: { type: 'number' }
              }
            }
          }
        },
        TableResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            number: { type: 'integer' },
            status: { type: 'string', enum: ['FREE', 'OCCUPIED', 'CLOSING', 'CLOSED'] },
            priority: { type: 'string', enum: ['MEDIUM', 'HIGH'], nullable: true },
            capacity: { type: 'integer' },
            currentPeople: { type: 'integer' },
            openedAt: { type: 'string', format: 'date-time', nullable: true },
            closedAt: { type: 'string', format: 'date-time', nullable: true },
            restaurantId: { type: 'string', format: 'uuid' },
            waiterId: { type: 'string', format: 'uuid', nullable: true },
            summary: {
              type: 'object',
              properties: {
                totalConsumption: { type: 'number' },
                totalItemsCount: { type: 'integer' },
                ordersCount: { type: 'integer' }
              }
            }
          },
        },
        UpsellRuleResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            triggerProductId: { type: 'string', format: 'uuid' },
            triggerProduct: { type: 'object' },
            upgradeProductId: { type: 'string', format: 'uuid' },
            upgradeProduct: { type: 'object' },
            isActive: { type: 'boolean' },
          }
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // We'll point to routes to pick up @swagger annotations if we add them later
  // For now, we are basic config.
  apis: ['./src/interfaces/http/routes.ts', './src/interfaces/http/routes/*.ts', './src/interfaces/http/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
