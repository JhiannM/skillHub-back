
export function successResponse(res, message, data, statusCode = 200) {

    return res.status(statusCode).json({

        success: true,
        message: message,
        data,
    });
}

export function errorResponse(res, message, statusCode = 400, data = null) {

    return res.status(statusCode).json({

        success: false,
        message: message,
        data: data,
    });

}