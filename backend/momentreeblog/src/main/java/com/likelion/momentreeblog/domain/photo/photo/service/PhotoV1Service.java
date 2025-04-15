package com.likelion.momentreeblog.domain.photo.photo.service;

import com.likelion.momentreeblog.domain.photo.photo.entity.Photo;
import com.likelion.momentreeblog.domain.photo.photo.repository.PhotoRepository;
import com.likelion.momentreeblog.domain.s3.dto.response.PreSignedUrlMultiResponseDto;
import com.likelion.momentreeblog.domain.s3.dto.response.PreSignedUrlResponseDto;
import com.likelion.momentreeblog.domain.s3.service.S3V1Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PhotoV1Service {

    private final PhotoRepository photoRepository;
    private final S3V1Service s3V1Service;

    // 최대 다중 삭제 개수 제한 (예: 최대 20장)
    private static final int MAX_DELETE_COUNT = 15;


    //포토 id로 조회
    @Transactional(readOnly = true)
    public Photo getPhotoById(Long photoId) {
        return photoRepository.findById(photoId)
                .orElseThrow(() -> new IllegalArgumentException("포토를 찾을 수 없습니다.  포토id :: " + photoId));
    }


    // 단일 사진 조회
    //db에서 사진을 조회 후 s3 get 프리사인드 url을 생성.
    @Transactional(readOnly = true)
    public PreSignedUrlResponseDto getPhotoUrl(Long photoId) {
        try {
            Photo photo = getPhotoById(photoId);
            return s3V1Service.generateGetPresignedUrl(photo.getUrl());
        } catch (Exception e) {
            throw new RuntimeException("사진을 검색하는 중 오류가 발생했습니다. :: " + e.getMessage(), e);
        }
    }


    //다중 사진 조회
    @Transactional(readOnly = true)
    public PreSignedUrlMultiResponseDto getMultiPhotoUrls(List<String> keys) {
        try {
            List<PreSignedUrlResponseDto> urls = s3V1Service.generateGetPresignedUrlMulti(keys);
            return PreSignedUrlMultiResponseDto.builder()
                    .urls(urls)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("여러 사진을 조회하는 중 오류가 발생했습니다  ::  " + e.getMessage(), e);
        }
    }


    // 단일 사진 삭제
    @Transactional
    public void deletePhoto(Long photoId) {
        Photo photo = getPhotoById(photoId);

        try {
            s3V1Service.deleteS3Object(photo.getUrl());
        } catch (Exception e) {
            throw new RuntimeException(photoId + "에 해당하는 s3 객체 삭제를 실패했습니다");
        }

        photoRepository.delete(photo);
    }


    //다중 사진 삭제
    @Transactional
    public void deletePhotoList(List<Long> photoIdList) {
        if (photoIdList.size() > MAX_DELETE_COUNT) {
            throw new IllegalArgumentException("한 번에 최대 " + MAX_DELETE_COUNT + "장만 삭제할 수 있습니다.");
        }

        for (Long id : photoIdList) {
            deletePhoto(id);
        }
    }
} 