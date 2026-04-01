import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ActivityService } from './activity.service';
import type { ActivityFilters, ActivityLevel } from './activity.service';

@UseGuards(JwtAuthGuard)
@Controller('api/activity')
export class ActivityController {
    constructor(private readonly activityService: ActivityService) { }

    @Get()
    findAll(
        @Query('source') source?: string,
        @Query('level') level?: string,
        @Query('action') action?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const filters: ActivityFilters = {
            source,
            level: level as ActivityLevel | 'all' | undefined,
            action,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        };
        return this.activityService.findAll(filters);
    }
}
