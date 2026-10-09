package br.com.despensa.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import br.com.despensa.data.local.entity.BaixaEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface BaixaDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun registrar(baixa: BaixaEntity)

    /** Total R$ perdido no mês (soma DESCARTADO desde o 1º dia do mês, 00h local). */
    @Query("SELECT COALESCE(SUM(valorTotal), 0.0) FROM baixa WHERE motivo = 'DESCARTADO' AND ts >= :inicioMes")
    fun perdidosNoMes(inicioMes: Long): Flow<Double>

    @Query("SELECT COALESCE(SUM(valorTotal), 0.0) FROM baixa WHERE motivo = 'DESCARTADO' AND ts >= :inicioMes")
    suspend fun perdidosNoMesSync(inicioMes: Long): Double

    @Query("DELETE FROM baixa")
    suspend fun limparTudo()
}
