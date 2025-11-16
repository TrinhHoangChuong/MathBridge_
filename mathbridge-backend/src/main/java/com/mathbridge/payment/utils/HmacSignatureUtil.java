package com.mathbridge.payment.utils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

/**
 * Utility class để tạo HMAC SHA256 signature cho MoMo payment
 */
public class HmacSignatureUtil {

    private static final String HMAC_SHA256 = "HmacSHA256";

    /**
     * Tạo HMAC SHA256 signature từ raw data và secret key
     * 
     * @param secretKey Secret key từ MoMo
     * @param rawData Raw data string cần ký
     * @return Hex string của signature
     * @throws NoSuchAlgorithmException
     * @throws InvalidKeyException
     */
    public static String sign(String secretKey, String rawData) throws NoSuchAlgorithmException, InvalidKeyException {
        SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
        Mac mac = Mac.getInstance(HMAC_SHA256);
        mac.init(secretKeySpec);
        byte[] rawHmac = mac.doFinal(rawData.getBytes(StandardCharsets.UTF_8));
        return bytesToHex(rawHmac);
    }

    /**
     * Convert byte array thành hex string
     */
    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}

