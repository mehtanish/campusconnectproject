package com.campuspulse.exception;

import com.campuspulse.dto.complaint.ComplaintResponse;

public final class DuplicateComplaintException extends RuntimeException {

    private final ComplaintResponse existingComplaint;

    public DuplicateComplaintException(ComplaintResponse existingComplaint) {
        super("An active complaint for this issue already exists at this location.");
        this.existingComplaint = existingComplaint;
    }

    public ComplaintResponse getExistingComplaint() {
        return existingComplaint;
    }
}