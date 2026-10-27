package com.campus.market.common;

import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BizException.class)
    public Result<Void> biz(BizException e) {
        return Result.fail(e.getMessage());
    }

    @ExceptionHandler({BindException.class, HttpMessageNotReadableException.class,
            MissingServletRequestParameterException.class, IllegalArgumentException.class})
    public Result<Void> badRequest(Exception e) {
        String msg = e instanceof BindException be && be.getBindingResult().getFieldError() != null
                ? be.getBindingResult().getFieldError().getDefaultMessage()
                : "请求参数不合法";
        return Result.fail(msg);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public Result<Void> tooLarge(MaxUploadSizeExceededException e) {
        return Result.fail("上传文件大小超出限制");
    }

    @ExceptionHandler(Exception.class)
    public Result<Void> error(Exception e) {
        e.printStackTrace();
        return Result.fail("服务器内部错误");
    }
}
