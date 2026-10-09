package br.com.despensa.presentation.economia

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import br.com.despensa.data.local.dao.BaixaDao
import br.com.despensa.domain.formatarReais
import br.com.despensa.domain.inicioDoMes
import br.com.despensa.domain.proporcaoConsumida
import br.com.despensa.presentation.theme.LimaNeon
import br.com.despensa.presentation.theme.Pimenta
import br.com.despensa.presentation.theme.RoxoEletrico
import br.com.despensa.presentation.theme.Tinta
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.SharingStarted
import javax.inject.Inject
import androidx.lifecycle.viewModelScope

/** Tela R$ (US07): salvos (CONSUMIDO no mês) vs perdidos (DESCARTADO no mês). */
@OptIn(ExperimentalCoroutinesApi::class)
@HiltViewModel
class EconomiaViewModel @Inject constructor(
    baixaDao: BaixaDao
) : ViewModel() {
    /** Marco fixo na criação do VM: 1º dia do mês 00h (não recalcula a cada coleta). */
    private val marco: Long = inicioDoMes(System.currentTimeMillis())

    private val salvosFluxo: Flow<Double> = baixaDao.consumidosNoMes(marco)
    private val perdidosFluxo: Flow<Double> = baixaDao.perdidosNoMes(marco)

    val salvos: StateFlow<Double> = salvosFluxo
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)
    val perdidos: StateFlow<Double> = perdidosFluxo
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    /** Expõe o marco p/ testes de UI/preview (default = mês corrente). */
    fun marcoMes(): Long = marco
}

@Composable
fun EconomiaScreen(vm: EconomiaViewModel = hiltViewModel()) {
    val salvos by vm.salvos.collectAsState()
    val perdidos by vm.perdidos.collectAsState()
    val proporcao = proporcaoConsumida(salvos, perdidos)
    val pctConsumido = (proporcao * 100).toInt()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp)
    ) {
        Spacer(Modifier.height(16.dp))
        Text(
            "Você salvou em ${mesAtual()}",
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        // HERO: valor salvo é o maior texto da tela, display extrabold com brilho lima
        // (identidade, regra 4 — "Noite Neon na Cozinha").
        Text(
            "R$ ${formatarReais(salvos)}",
            fontWeight = FontWeight.Black,
            fontSize = 52.sp,
            lineHeight = 56.sp,
            color = LimaNeon,
            modifier = Modifier.shadow(12.dp, RoundedCornerShape(8.dp))
        )
        Text(
            "R$ ${formatarReais(perdidos)} perdidos",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
            color = Pimenta
        )
        Spacer(Modifier.height(16.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            EconomiaCard(
                titulo = "CONSUMIDO",
                valor = salvos,
                cor = LimaNeon,
                modifier = Modifier.weight(1f)
            )
            EconomiaCard(
                titulo = "DESCARTADO",
                valor = perdidos,
                cor = Pimenta,
                modifier = Modifier.weight(1f)
            )
        }
        Spacer(Modifier.height(16.dp))
        Text(
            "Consumido × descartado",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
        )
        Spacer(Modifier.height(8.dp))
        // Barra simples consumido×descartado (sem lib nova): lima = consumido, trilho = perdido.
        LinearProgressIndicator(
            progress = { proporcao },
            modifier = Modifier
                .fillMaxWidth()
                .height(14.dp),
            color = LimaNeon,
            trackColor = Pimenta
        )
        Spacer(Modifier.height(4.dp))
        Text(
            if (salvos + perdidos <= 0) "Nada lançado este mês — dê baixa nos itens do estoque."
            else "$pctConsumido% consumido · ${100 - pctConsumido}% descartado",
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(Modifier.height(24.dp))
    }
}

@Composable
private fun EconomiaCard(titulo: String, valor: Double, cor: androidx.compose.ui.graphics.Color, modifier: Modifier = Modifier) {
    OutlinedCard(
        modifier = modifier,
        shape = RoundedCornerShape(18.dp),
        border = BorderStroke(2.dp, Tinta.copy(alpha = 0.9f)),
        colors = CardDefaults.outlinedCardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(Modifier.padding(12.dp)) {
            Text(
                titulo,
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Black),
                color = RoxoEletrico
            )
            Text(
                "R$ ${formatarReais(valor)}",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Black),
                color = cor
            )
        }
    }
}

private fun mesAtual(): String {
    val nome = java.text.SimpleDateFormat("MMMM", java.util.Locale("pt", "BR"))
        .format(java.util.Date())
    return nome.replaceFirstChar { it.uppercase() }
}
