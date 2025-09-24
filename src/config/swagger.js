const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/**
 * Swagger configuration for API documentation
 */

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Haid API',
      version: '1.0.0',
      description: 'Humanitarian Aid Distribution Platform API - Built on Hedera Hashgraph',
      contact: {
        name: 'Haid Team',
        email: 'support@haid.org'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.haid.org' 
          : `http://localhost:${process.env.PORT || 3000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password', 'role'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'ngo@example.com'
            },
            password: {
              type: 'string',
              minLength: 8,
              example: 'SecurePass123'
            },
            role: {
              type: 'string',
              enum: ['admin', 'NGO', 'volunteer'],
              example: 'NGO'
            }
          }
        },
        UserResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            email: {
              type: 'string',
              example: 'ngo@example.com'
            },
            role: {
              type: 'string',
              example: 'NGO'
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          }
        },
        Refugee: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '12345678-1234-4123-8123-123456789012'
            },
            did: {
              type: 'string',
              example: 'did:haid:12345678-1234-4123-8123-123456789012'
            },
            qrCode: {
              type: 'string',
              format: 'data-url',
              example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        Event: {
          type: 'object',
          required: ['name', 'date', 'location', 'ngoId'],
          properties: {
            name: {
              type: 'string',
              minLength: 3,
              maxLength: 255,
              example: 'Morning Food Distribution'
            },
            date: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:00:00Z'
            },
            location: {
              type: 'string',
              minLength: 3,
              maxLength: 255,
              example: 'Refugee Camp A'
            },
            ngoId: {
              type: 'integer',
              example: 1
            }
          }
        },
        EventResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'Morning Food Distribution'
            },
            date: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:00:00Z'
            },
            location: {
              type: 'string',
              example: 'Refugee Camp A'
            },
            ngoId: {
              type: 'integer',
              example: 1
            },
            status: {
              type: 'string',
              enum: ['active', 'completed', 'cancelled'],
              example: 'active'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T09:00:00Z'
            }
          }
        },
        Collection: {
          type: 'object',
          required: ['refugeeDid', 'eventId'],
          properties: {
            refugeeDid: {
              type: 'string',
              pattern: '^did:haid:[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
              example: 'did:haid:12345678-1234-4123-8123-123456789012'
            },
            eventId: {
              type: 'integer',
              example: 1
            }
          }
        },
        ManualCollection: {
          type: 'object',
          required: ['refugeeDid', 'eventId', 'reason'],
          properties: {
            refugeeDid: {
              type: 'string',
              pattern: '^did:haid:[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
              example: 'did:haid:12345678-1234-4123-8123-123456789012'
            },
            eventId: {
              type: 'integer',
              example: 1
            },
            reason: {
              type: 'string',
              minLength: 10,
              maxLength: 500,
              example: 'Refugee lost their wristband due to emergency evacuation'
            }
          }
        },
        BulkCollection: {
          type: 'object',
          required: ['collections'],
          properties: {
            collections: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Collection'
              }
            }
          }
        },
        CollectionResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Aid collection recorded successfully'
            },
            data: {
              type: 'object',
              properties: {
                refugeeDid: {
                  type: 'string',
                  example: 'did:haid:12345678-1234-4123-8123-123456789012'
                },
                eventId: {
                  type: 'integer',
                  example: 1
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  example: '2024-01-15T10:30:00Z'
                },
                transactionId: {
                  type: 'string',
                  example: '0.0.123456@1642248600.123456789'
                },
                consensusTimestamp: {
                  type: 'string',
                  format: 'date-time',
                  example: '2024-01-15T10:30:00.123Z'
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Validation failed'
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object'
                  }
                },
                status: {
                  type: 'integer',
                  example: 400
                }
              }
            }
          }
        },
        Analytics: {
          type: 'object',
          properties: {
            eventId: {
              type: 'integer',
              example: 1
            },
            totalServed: {
              type: 'integer',
              example: 150
            },
            duplicatesPrevented: {
              type: 'integer',
              example: 5
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi
};