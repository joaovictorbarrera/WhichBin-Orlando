package com.whichbin.whichbin_api.model;

/** RECYCLING means accepted in the residential cart; drop-off recycling is separate. */
public enum DisposalMethod {
    RECYCLING, GARBAGE, HAZARDOUS_WASTE, LARGE_ITEM, YARD_WASTE,
    COMPOST, REUSE, DROP_OFF, MULTIPLE_METHODS, SPECIAL_HANDLING, CHECK_CITY_GUIDANCE
}
