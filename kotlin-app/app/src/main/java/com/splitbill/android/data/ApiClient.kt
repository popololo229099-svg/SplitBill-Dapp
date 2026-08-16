package com.splitbill.android.data

import com.splitbill.android.Config
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import java.util.concurrent.TimeUnit

interface SplitBillApi {
    @GET("api/status")
    suspend fun getStatus(): Map<String, String>

    @GET("api/transactions")
    suspend fun getTransactions(): List<TransactionDto>

    @POST("api/transactions")
    suspend fun recordTransaction(@Body body: RecordTransactionRequest): TransactionDto
}

object ApiClient {

    private val httpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    val api: SplitBillApi by lazy {
        Retrofit.Builder()
            .baseUrl(Config.API_BASE_URL.trimEnd('/') + "/")
            .client(httpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(SplitBillApi::class.java)
    }
}
