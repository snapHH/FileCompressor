package com.example.filecompresser;

import com.example.filecompresser.FileCompressionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileCompressionService compressionService;

    @PostMapping("/compress")
    public ResponseEntity<byte[]> compressFiles(@RequestParam("files") List<MultipartFile> files) {
        try {
            byte[] compressedData = compressionService.compressFiles(files);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=compressed_files.zip");
            return new ResponseEntity<>(compressedData, headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
