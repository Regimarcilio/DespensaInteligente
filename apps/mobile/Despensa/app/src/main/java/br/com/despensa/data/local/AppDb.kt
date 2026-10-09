package br.com.despensa.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverter
import androidx.room.TypeConverters
import br.com.despensa.data.local.dao.EstoqueDao
import br.com.despensa.data.local.entity.EstoqueEntity
import br.com.despensa.data.local.entity.LocalEstoque

class Converters {
    @TypeConverter fun fromLocal(v: LocalEstoque): String = v.name
    @TypeConverter fun toLocal(v: String): LocalEstoque =
        runCatching { LocalEstoque.valueOf(v) }.getOrDefault(LocalEstoque.DESPENSA)
}

@Database(entities = [EstoqueEntity::class], version = 1, exportSchema = true)
@TypeConverters(Converters::class)
abstract class AppDb : RoomDatabase() {
    abstract fun estoque(): EstoqueDao
}
