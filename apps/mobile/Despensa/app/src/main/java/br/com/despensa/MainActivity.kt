package br.com.despensa

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import br.com.despensa.presentation.estoque.EstoqueScreen
import br.com.despensa.presentation.estoque.EstoqueViewModel
import br.com.despensa.presentation.notif.PedidoPermissaoNotificacao
import br.com.despensa.presentation.theme.DespensaTheme
import br.com.despensa.presentation.theme.LimaNeon
import br.com.despensa.presentation.theme.UvaNoite
import br.com.despensa.presentation.theme.UvaProfunda
import dagger.hilt.android.AndroidEntryPoint

@OptIn(ExperimentalMaterial3Api::class)
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            // Sprint 1: dark-first fixo (US10 full com TalkBack vem na S4).
            DespensaTheme(escuro = true) {
                // Sprint 2 (RF-002): rationale próprio + pedido do sistema na 1ª abertura.
                PedidoPermissaoNotificacao()
                val vm: EstoqueViewModel = hiltViewModel()
                val itens by vm.itens.collectAsState()
                Scaffold(
                    topBar = {
                        TopAppBar(
                            title = {
                                Column(modifier = Modifier.fillMaxWidth()) {
                                    Text(
                                        "Despensa",
                                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Black),
                                        color = LimaNeon
                                    )
                                    Text(
                                        "${itens.size} ${if (itens.size == 1) "item" else "itens"} em estoque",
                                        style = MaterialTheme.typography.labelMedium,
                                        color = MaterialTheme.colorScheme.onPrimaryContainer
                                    )
                                }
                            },
                            colors = TopAppBarDefaults.topAppBarColors(containerColor = UvaProfunda)
                        )
                    }
                ) { pad ->
                    Spacer(Modifier.height(0.dp))
                    Column(Modifier.padding(pad)) {
                        EstoqueScreen(vm)
                    }
                }
            }
        }
    }
}
