package com.greenplan.api.common;

public final class StringUtils {

    private StringUtils() {
    }

    public static String normalizeBlankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
