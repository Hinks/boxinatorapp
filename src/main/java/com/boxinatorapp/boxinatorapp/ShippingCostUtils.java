package com.boxinatorapp.boxinatorapp;

import java.util.HashMap;
import java.util.Map;

public class ShippingCostUtils {

  public static Map<String, Float> countryMultipliers(){

    Map<String, Float> multipliers = new HashMap<>();
    multipliers.put("Sweden", 1.3f);
    multipliers.put("China", 4.0f);
    multipliers.put("Brazil", 8.6f);
    multipliers.put("Australia", 7.2f);

    return multipliers;
  }

  public static float calculateCost(Map<String, Float> multipliers, String country, float weight) {

    return multipliers.getOrDefault(country, 0f) * weight;
  }

}
