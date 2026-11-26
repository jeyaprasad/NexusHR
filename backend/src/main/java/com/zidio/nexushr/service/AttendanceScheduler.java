package com.zidio.nexushr.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AttendanceScheduler {

    private final AttendanceService attendanceService;

    @Scheduled(cron = "0 0 19 * * MON-FRI")
    public void autoMarkAbsent() {
        log.info("Running daily auto-attendance processing...");
        int count = attendanceService.autoProcessToday();
        log.info("Auto-attendance complete. Marked {} employees as absent.", count);
    }
}
