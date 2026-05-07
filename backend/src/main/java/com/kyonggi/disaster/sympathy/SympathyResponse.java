package com.kyonggi.disaster.sympathy;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SympathyResponse {
    private final Long    reportId;
    private final int     count;
    private final boolean alertTriggered;
}
