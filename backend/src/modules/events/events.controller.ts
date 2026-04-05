import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto, UpdateEventStatusDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { EventStatus } from '../../common/enums';

@ApiTags('events')
@Controller('api/v1/events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created' })
  async create(@Body() createEventDto: CreateEventDto, @CurrentUser('id') userId: string) {
    return this.eventsService.create(createEventDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: EventStatus })
  @ApiQuery({ name: 'clientId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: EventStatus,
    @Query('clientId') clientId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.eventsService.findAll(page || 1, limit || 10, status, clientId, startDate, endDate);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming events' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUpcoming(@Query('limit') limit?: number) {
    return this.eventsService.getUpcomingEvents(limit || 5);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({ status: 200, description: 'Event returned' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update event' })
  @ApiResponse({ status: 200, description: 'Event updated' })
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.eventsService.update(id, updateEventDto, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update event status' })
  @ApiResponse({ status: 200, description: 'Event status updated' })
  async updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateEventStatusDto) {
    return this.eventsService.updateStatus(id, updateStatusDto.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel event' })
  @ApiResponse({ status: 200, description: 'Event cancelled' })
  async remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}